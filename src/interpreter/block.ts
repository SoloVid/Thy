import { CompileError } from "compile-error"
import { parse } from "parser/parser"
import { makeTokenizer } from "tokenizer"
import { tExport } from "tokenizer/token-type"
import { Block, Idea } from "tree"
import { isDeclaration } from "tree/assignment"
import {
  dissectErrorTraceAtCloserBaseline,
  replaceErrorTraceLine,
  transformErrorTrace,
} from "../utils/error-helper"
import { interpretThyCall } from "./call"
import { interpretThyExpression } from "./expression"
import {
  InterpreterErrorWithContext,
  makeInterpreterCompileError,
  makeInterpreterNodeError,
} from "./interpreter-error"
import { interpretThyStatement } from "./statement"
import {
  ThyBlockContext
} from "./types"
import { returnStyle } from "tree/block"
import assert from "utils/assert"

type BlockOptions = {
  closure: ThyBlockContext["closure"]
  functionName?: string
  sourceFile: ThyBlockContext["sourceFile"]
  additionalTraceLinesToHide?: number
}

type UnknownFunction = (...args: readonly unknown[]) => unknown
type InterpretedBlockWithMeta = {
  interpreted: UnknownFunction
}

export function interpretThyBlockSource(
  thySource: string,
  options: Partial<BlockOptions> = {},
): UnknownFunction {
  return interpretThyBlockSourceWithMeta(thySource, options).interpreted
}

export function interpretThyBlockSourceWithMeta(
  thySource: string,
  options: Partial<BlockOptions> = {},
): InterpretedBlockWithMeta {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(thySource, errors)
  const { top } = parse(tokenizer, errors)
  if (errors.length > 0) {
    throw makeInterpreterCompileError(
      errors[0],
    )
  }
  return interpretThyBlockNodeWithMeta(top, {
    closure: options.closure ?? {},
    functionName: options.functionName,
    sourceFile: options.sourceFile ?? "inline-thy-code",
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
  })
}

export function interpretThyBlockNode(
  block: Block,
  options: BlockOptions,
): UnknownFunction {
  return interpretThyBlockNodeWithMeta(block, options).interpreted
}

function makeHelper(block: Block, options: BlockOptions, args: readonly unknown[]) {
  // I don't fully understand the -1 here, but somehow we want a different number of lines masked in the top-level case vs. thy-internal cases.
  const additionalTraceLinesToHide = options.additionalTraceLinesToHide ?? -1

  const context: ThyBlockContext = {
    argsToUse: [...args],
    givenUsed: false,
    implicitArguments:
      args.length > 0 && typeof args[0] === "object" && !!args[0]
        ? (args[0] as Record<string, unknown>)
        : {},
    implicitArgumentFirstUsed: null,
    symbolTable: block.symbolTable,
    closure: options.closure,
    variablesInBlock: {},
    sourceFile: options.sourceFile,
  }
  function evaluateStatement(
    idea: Idea,
  ): [shouldReturn: boolean, value: unknown] {
    if (idea.type === "blank-line" || idea.type === "comment" || idea.type === "type-assignment") {
      return [false, undefined]
    }
    if (idea.type === "return") {
      return [true, interpretThyExpression(context, idea.args[0]).target]
    }
    if (idea.type === "let-call") {
      if (idea.call === null) {
        return [false, undefined]
      }
      assert(idea.call.type !== "await-call", "TODO: await-call not yet implemented")
      const returnValue = interpretThyCall(context, idea.call)
      if (returnValue !== undefined) {
        return [true, returnValue]
      }
      return [false, undefined]
    }
    return [false, interpretThyStatement(context, idea)]
  }

  function formulateResult() {
    const exportSource =
      block.exportedSymbols
    if (block.exportedSymbols.length === 0 || block.returnStyle === returnStyle.explicitReturn) {
      return undefined
    }
    const implicitReturn: Record<string, unknown> = {}
    for (const variableName of exportSource) {
      Object.defineProperty(implicitReturn, variableName, {
        enumerable: true,
        get() {
          return context.variablesInBlock[variableName]
        },
        set(newValue) {
          if (block.symbolTable.getSymbolInfo(variableName)?.isConstant) {
            throw new Error(
              `${variableName} is immutable and cannot be overwritten`,
            )
          }
          context.variablesInBlock[variableName] = newValue
        },
      })
    }
    return implicitReturn
  }

  return {
    additionalTraceLinesToHide,
    context,
    evaluateStatement,
    formulateResult,
  }
}

export function interpretThyBlockNodeWithMeta(
  block: Block,
  options: BlockOptions,
): InterpretedBlockWithMeta {
  const functionName = options.functionName ?? "<anonymous>"

  if (block.isAsync) {
    return interpretThyAsyncBlock(functionName, block, options)
  }

  return interpretThySyncBlock(functionName, block, options)
}

function interpretThyAsyncBlock(
  functionName: string,
  block: Block,
  options: BlockOptions,
) {
  const objWithBlockFunction = {
    [functionName]: async (...args: readonly unknown[]) => {
      const helper = makeHelper(block, options, args)
      for (const idea of block.ideas) {
        if (idea.type === "let-call" && idea.call && idea.call.type === "await-call") {
          const returnValue = await interpretThyExpression(helper.context, idea.call.args[0]).target
          if (returnValue !== undefined) {
            return returnValue
          }
          continue
        }

        // For async stack traces, the trace is a bit different before and after a true await.
        const errorHere = new Error()
        try {
          const [shouldReturn, value] = helper.evaluateStatement(idea)
          if (shouldReturn) {
            return value
          } else {
            if (value instanceof Promise) {
              await value
            }
          }
        } catch (e) {
          throwTransformedError(
            e,
            functionName,
            options.sourceFile,
            helper.additionalTraceLinesToHide,
            errorHere,
          )
        }
      }
      return helper.formulateResult()
    },
  }
  return {
    interpreted: objWithBlockFunction[functionName],
  }
}

function interpretThySyncBlock(
  functionName: string,
  block: Block,
  options: BlockOptions,
) {
  const objWithBlockFunction = {
    [functionName]: (...args: readonly unknown[]) => {
      const helper = makeHelper(block, options, args)
      try {
        for (const idea of block.ideas) {
          const [shouldReturn, value] = helper.evaluateStatement(idea)
          if (shouldReturn) {
            return value
          }
        }
      } catch (e) {
        throwTransformedError(
          e,
          functionName,
          options.sourceFile,
          helper.additionalTraceLinesToHide,
        )
      }
      return helper.formulateResult()
    },
  }
  return {
    interpreted: objWithBlockFunction[functionName],
  }
}

function throwTransformedError(
  errorCloseToCall: unknown,
  functionName: string,
  sourceFile: string,
  additionalTraceLinesToHide: number,
  altErrorHere?: Error,
) {
  if (errorCloseToCall instanceof InterpreterErrorWithContext) {
    if (!(errorCloseToCall.cause instanceof Error)) {
      throw errorCloseToCall.cause
    }
    const e = errorCloseToCall.cause

    const errorHere = new Error()
    const errorDissectedAtCall = dissectErrorTraceAtCloserBaseline(
      e,
      errorCloseToCall,
      errorCloseToCall.additionalDepthToShave,
      errorCloseToCall.altCloseError,
      errorCloseToCall.altAdditionalDepthToShave,
    )
    // console.log(errorDissectedAtCall)
    const errorDissectedHere = dissectErrorTraceAtCloserBaseline(
      e,
      errorHere,
      additionalTraceLinesToHide,
      altErrorHere,
      additionalTraceLinesToHide,
    )
    // console.log(errorDissectedHere)
    const errorTraceLocation = errorCloseToCall.sourceLocation

    throw transformErrorTrace(e, () => {
      return [
        errorDissectedAtCall.delta,
        replaceErrorTraceLine(errorDissectedHere.pivot, 0, () => [
          functionName,
          sourceFile,
          errorTraceLocation.line + 1,
          errorTraceLocation.column + 1,
        ]),
        errorDissectedHere.shared,
      ].join("\n")
    })
  }
  throw errorCloseToCall
}

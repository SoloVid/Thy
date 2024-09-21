import { CompileError } from "compile-error"
import { parse } from "parser/parser"
import { makeTokenizer } from "tokenizer"
import { Block, Idea } from "tree"
import { returnStyle } from "tree/block"
import assert from "utils/assert"
import {
  dissectErrorTraceAtCloserBaseline,
  replaceErrorTraceLine,
  transformErrorTrace,
} from "../utils/error-helper"
import { forwardWait, MayWait, notWait } from "./async-helper"
import { interpretThyCall } from "./call"
import {
  RuntimeFunction,
  RuntimeObject,
  RuntimeValue,
  yesIThinkThisIsRuntimeObject,
  yesThisValueIsForRuntime,
} from "./dynamic-type"
import { interpretThyExpression } from "./expression"
import {
  InterpreterErrorWithContext,
  makeInterpreterCompileError,
} from "./interpreter-error"
import { interpretThyStatement } from "./statement"
import { ThyBlockContext } from "./types"

type BlockOptions = {
  closure: ThyBlockContext["closure"]
  functionName?: string
  sourceFile: ThyBlockContext["sourceFile"]
  additionalTraceLinesToHide?: number
}

export type ApiUnknownFunction = (...args: readonly unknown[]) => unknown
type ApiInterpretedBlockWithMeta = {
  interpreted: ApiUnknownFunction
}

export function interpretThyBlockSource(
  thySource: string,
  options: Partial<BlockOptions> = {},
): ApiUnknownFunction {
  return interpretThyBlockSourceWithMeta(thySource, options).interpreted
}

export function interpretThyBlockSourceWithMeta(
  thySource: string,
  options: Partial<BlockOptions> = {},
): ApiInterpretedBlockWithMeta {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(thySource, errors)
  const { top } = parse(tokenizer, errors)
  if (errors.length > 0) {
    throw makeInterpreterCompileError(errors[0])
  }
  return interpretThyBlockNodeWithMeta(top, {
    closure: options.closure ?? {},
    functionName: options.functionName,
    sourceFile: options.sourceFile ?? "inline-thy-code",
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
  }) as ApiInterpretedBlockWithMeta
}

export function interpretThyBlockNode(
  block: Block,
  options: BlockOptions,
): RuntimeFunction {
  return interpretThyBlockNodeWithMeta(block, options)
    .interpreted as RuntimeFunction
}

function makeHelper(
  block: Block,
  options: BlockOptions,
  args: readonly RuntimeValue[],
) {
  // I don't fully understand the -1 here, but somehow we want a different number of lines masked in the top-level case vs. thy-internal cases.
  const additionalTraceLinesToHide = options.additionalTraceLinesToHide ?? -1

  const context: ThyBlockContext = {
    argsToUse: [...args],
    givenUsed: false,
    implicitArguments:
      args.length > 0 && typeof args[0] === "object" && !!args[0]
        ? yesIThinkThisIsRuntimeObject(args[0])
        : {},
    implicitArgumentFirstUsed: null,
    isAsync: block.isAsync,
    symbolTable: block.symbolTable,
    closure: options.closure,
    variablesInBlock: {},
    sourceFile: options.sourceFile,
  }

  type IdeaResult = [shouldReturn: boolean, value: RuntimeValue | undefined]
  function evaluateStatement(idea: Idea): MayWait<IdeaResult> {
    if (
      idea.type === "blank-line" ||
      idea.type === "comment" ||
      idea.type === "type-assignment"
    ) {
      return notWait([false, undefined])
    }
    if (idea.type === "return") {
      return forwardWait(
        interpretThyExpression(context, idea.args[0]),
        (ie) => [true, ie.target],
      )
    }
    if (idea.type === "let-call") {
      if (idea.call === null) {
        return notWait([false, undefined])
      }
      return forwardWait(interpretThyCall(context, idea.call), (returnValue) =>
        returnValue === undefined ? [false, undefined] : [true, returnValue],
      )
    }
    return forwardWait(interpretThyStatement(context, idea), () => [
      false,
      undefined,
    ])
  }

  function formulateResult() {
    const exportSource = block.exportedSymbols
    if (
      block.exportedSymbols.length === 0 ||
      block.returnStyle === returnStyle.explicitReturn
    ) {
      return undefined
    }
    const implicitReturn: RuntimeObject = {}
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
    return yesThisValueIsForRuntime(implicitReturn)
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
): {
  interpreted: (
    ...args: readonly RuntimeValue[]
  ) => RuntimeValue | undefined | PromiseLike<RuntimeValue | undefined>
} {
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
  const objWithBlockFunction: {
    [functionName: string]: (
      ...args: readonly RuntimeValue[]
    ) => PromiseLike<RuntimeValue | undefined>
  } = {
    [functionName]: async (...args) => {
      // Note: I moved this up out of the loop. Not sure if that is going to break stuff.
      // For async stack traces, the trace is a bit different before and after a true await.
      const errorHere = new Error()

      const helper = makeHelper(block, options, args)
      for (const idea of block.ideas) {
        try {
          const statementResult = helper.evaluateStatement(idea)
          const [shouldReturn, value] = statementResult.wait
            ? await statementResult.promise
            : statementResult.value
          if (shouldReturn) {
            return value
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
  const objWithBlockFunction: {
    [functionName: string]: (
      ...args: readonly RuntimeValue[]
    ) => RuntimeValue | undefined
  } = {
    [functionName]: (...args) => {
      const helper = makeHelper(block, options, args)
      try {
        for (const idea of block.ideas) {
          const statementResult = helper.evaluateStatement(idea)
          assert(
            !statementResult.wait,
            "It should be impossible for await to come up in non-async block",
          )
          const [shouldReturn, value] = statementResult.value
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
    // console.log("errorDissectedAtCall", errorDissectedAtCall)
    const errorDissectedHere = dissectErrorTraceAtCloserBaseline(
      e,
      errorHere,
      additionalTraceLinesToHide,
      altErrorHere,
      additionalTraceLinesToHide,
    )
    // console.log("errorDissectedHere", errorDissectedHere)
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

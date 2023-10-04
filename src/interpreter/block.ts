import { dissectErrorTraceAtCloserBaseline, replaceErrorTraceLine, transformErrorTrace } from "../utils/error-helper"
import { interpretThyCall } from "./call"
import { interpretThyExpression } from "./expression"
import { InterpreterErrorWithContext, makeInterpreterError } from "./interpreter-error"
import { splitThyStatements } from "./split-statements"
import { interpretThyStatement } from "./statement"
import { isAtomLiterally, Statement, ThyBlockContext } from "./types"

type BlockOptions = {
  closure: ThyBlockContext["closure"]
  closureVariableIsImmutable: ThyBlockContext["closureVariableIsImmutable"]
  functionName?: string
  sourceFile: ThyBlockContext["sourceFile"]
  startingLineIndex: number
  additionalTraceLinesToHide?: number
}

export function interpretThyBlock(
  thySource: string,
  options: Partial<BlockOptions> = {},
): (...args: readonly unknown[]) => unknown {
  const lines = thySource.split(/\r\n|\n/)
  return interpretThyBlockLines(lines, {
    closure: options.closure ?? {},
    closureVariableIsImmutable: options.closureVariableIsImmutable ?? {},
    functionName: options.functionName,
    sourceFile: options.sourceFile ?? "inline-thy-code",
    startingLineIndex: options.startingLineIndex ?? 0,
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
  })
}

export function interpretThyBlockLines(
  thySourceLines: readonly string[],
  options: BlockOptions,
): (...args: readonly unknown[]) => unknown {
  // I don't fully understand the -1 here, but somehow we want a different number of lines masked in the top-level case vs. thy-internal cases.
  const additionalTraceLinesToHide = options.additionalTraceLinesToHide ?? -1
  const statements = splitThyStatements(thySourceLines, options.startingLineIndex)
  const isAsync = statements.some(s => s.some(a => isAtomLiterally(a, "await")))
  let exportUsed = false
  let letUsed = false
  for (const statement of statements) {
    if (isAtomLiterally(statement[0], "export")) {
      if (letUsed) {
        throw makeInterpreterError(statement[0], `\`export\` cannot be used after \`let\``)
      }
      exportUsed = true
    }
    if (isAtomLiterally(statement[0], "let")) {
      if (exportUsed) {
        throw makeInterpreterError(statement[0], `\`let\` cannot be used after \`export\``)
      }
      letUsed = true
    }
    if (isAtomLiterally(statement[0], "return")) {
      if (exportUsed) {
        throw makeInterpreterError(statement[0], `\`return\` cannot be used after \`export\``)
      }
    }
  }

  function makeHelper(args: readonly unknown[]) {
    const context: ThyBlockContext = {
      argsToUse: [...args],
      givenUsed: false,
      implicitArguments: args.length > 0 && typeof args[0] === "object" && !!args[0] ? args[0] as Record<string, unknown> : {},
      implicitArgumentFirstUsed: null,
      variablesInBlock: {},
      variableIsImmutable: {},
      bareVariables: [],
      exportedVariables: [],
      closure: options.closure,
      closureVariableIsImmutable: options.closureVariableIsImmutable,
      thatValue: undefined,
      beforeThatValue: undefined,
      sourceFile: options.sourceFile,
    }

    function evaluateStatement(statement: Statement): [shouldReturn: boolean, value: unknown] {
      const parts = statement
      if (parts.length > 0) {
        if (isAtomLiterally(parts[0], "return")) {
          if (parts.length === 1) {
            throw makeInterpreterError(parts[0], `\`return\` takes exactly one parameter`)
          }
          if (parts.length > 2) {
            throw makeInterpreterError(parts[2], `\`return\` takes exactly one parameter`)
          }
          return [true, interpretThyExpression(context, parts[1]).target]
        }
        if (isAtomLiterally(parts[0], "let")) {
          if (parts.length <= 1) {
            return [false, undefined]
          }
          const [letKeyword, ...theRest] = parts
          const returnValue = interpretThyCall(context, theRest)
          if (returnValue !== undefined) {
            return [true, returnValue]
          }
          return [false, undefined]
        }

        return [false, interpretThyStatement(context, parts)]
      }
      return [false, undefined]
    }

    function formulateResult() {
      const exportSource = context.exportedVariables.length > 0 ? context.exportedVariables : context.bareVariables
      if (!letUsed && exportSource.length > 0) {
        const implicitReturn: Record<string, unknown> = {}
        for (const variableName of exportSource) {
          Object.defineProperty(implicitReturn, variableName, {
            enumerable: true,
            get() {
              return context.variablesInBlock[variableName]
            },
            set(newValue) {
              if (context.variableIsImmutable[variableName]) {
                throw new Error(`${variableName} is immutable and cannot be overwritten`)
              }
              context.variablesInBlock[variableName] = newValue
            },
          })
        }
        return implicitReturn
      }
      return undefined  
    }

    return {
      context,
      evaluateStatement,
      formulateResult,
    }
  }

  const functionName = options.functionName ?? "<anonymous>"

  if (isAsync) {
    const objWithBlockFunction = { [functionName]:  async (...args: readonly unknown[]) => {
      const helper = makeHelper(args)
      for (const statement of statements) {
        if (isAtomLiterally(statement[0], "let") && isAtomLiterally(statement[1], "await")) {
          if (statement.length !== 3) {
            throw makeInterpreterError(statement[1], `\`await\` takes 1 argument; got ${statement.length - 1}`)
          }
          const returnValue = await interpretThyExpression(helper.context, statement[2]).target
          if (returnValue !== undefined) {
            return returnValue
          }
          continue
        }

        // For async stack traces, the trace is a bit different before and after a true await.
        const errorHere = new Error("errorHere")
        try {
          const [shouldReturn, value] = helper.evaluateStatement(statement)
          if (shouldReturn) {
            return value
          } else {
            if (value instanceof Promise) {
              await value
            }
          }
        } catch (e) {
          throwTransformedError(e, functionName, options.sourceFile, additionalTraceLinesToHide, errorHere)
        }
      }
      return helper.formulateResult()
    } }
    return objWithBlockFunction[functionName]
  }

  const objWithBlockFunction = { [functionName]: (...args: readonly unknown[]) => {
    const helper = makeHelper(args)
    try {
      for (const statement of statements) {
        const [shouldReturn, value] = helper.evaluateStatement(statement)
        if (shouldReturn) {
          return value
        }
      }
    } catch (e) {
      throwTransformedError(e, functionName, options.sourceFile, additionalTraceLinesToHide)
    }
    return helper.formulateResult()
  } }
  return objWithBlockFunction[functionName]
}

function throwTransformedError(
  errorCloseToCall: unknown,
  functionName: string,
  sourceFile: string,
  additionalTraceLinesToHide: number,
  altErrorHere?: Error
) {
  if (errorCloseToCall instanceof InterpreterErrorWithContext) {
    if (!(errorCloseToCall.cause instanceof Error)) {
      throw errorCloseToCall.cause
    }
    const e = errorCloseToCall.cause

    const errorHere = new Error("errorHere")
    const errorDissectedAtCall = dissectErrorTraceAtCloserBaseline(e, errorCloseToCall, errorCloseToCall.additionalDepthToShave, errorCloseToCall.altCloseError, errorCloseToCall.altAdditionalDepthToShave)
    // console.log(errorDissectedAtCall)
    const errorDissectedHere = dissectErrorTraceAtCloserBaseline(e, errorHere, additionalTraceLinesToHide, altErrorHere, additionalTraceLinesToHide)
    // console.log(errorDissectedHere)
    const errorTraceLocation = errorCloseToCall.sourceLocation

    throw transformErrorTrace(e, (originalTraceLines) => {
      return [
        errorDissectedAtCall.delta,
        replaceErrorTraceLine(errorDissectedHere.pivot, 0, (func, file, line, column) => [
          functionName,
          sourceFile,
          errorTraceLocation.lineIndex + 1,
          errorTraceLocation.columnIndex + 1,
        ]),
        errorDissectedHere.shared,
      ].join("\n")
    })
  }
  throw errorCloseToCall
}

import assert from "../utils/assert"
import { interpretThyCall } from "./call"
import { interpretThyExpression } from "./expression"
import { splitThyStatements } from "./split-statements"
import { interpretThyStatement } from "./statement"
import type { Statement, ThyBlockContext } from "./types"

type BlockOptions = {
  closure: ThyBlockContext["closure"]
  closureVariableIsImmutable: ThyBlockContext["closureVariableIsImmutable"]
}

export function interpretThyBlock(
  thySource: string,
  options: BlockOptions = { closure: {}, closureVariableIsImmutable: {} },
): (...args: readonly unknown[]) => unknown {
  const lines = thySource.split(/\r\n|\n/)
  return interpretThyBlockLines(lines, options)
}

export function interpretThyBlockLines(
  thySourceLines: readonly string[],
  options: BlockOptions,
): (...args: readonly unknown[]) => unknown {
  const statements = splitThyStatements(thySourceLines)
  const isAsync = statements.some(s => s.some(a => a === "await"))
  let exportUsed = false
  let letUsed = false
  for (const statement of statements) {
    if (statement[0] === "export") {
      if (letUsed) {
        throw new Error(`\`export\` cannot be used after \`let\``)
      }
      exportUsed = true
    }
    if (statement[0] === "let") {
      if (exportUsed) {
        throw new Error(`\`let\` cannot be used after \`export\``)
      }
      letUsed = true
    }
    if (statement[0] === "return") {
      if (exportUsed) {
        throw new Error(`\`return\` cannot be used after \`export\``)
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
    }

    function evaluateStatement(statement: Statement): [shouldReturn: boolean, value: unknown] {
      const parts = statement
      if (parts.length > 0) {
        if (parts[0] === "return") {
          assert(parts.length === 2, `\`return\` takes exactly one parameter`)
          return [true, interpretThyExpression(context, parts[1]).target]
        }
        if (parts[0] === "let") {
          assert(parts.length > 1, `\`let\` requires a function call following it`)
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

  if (isAsync) {
    return async (...args: readonly unknown[]) => {
      const helper = makeHelper(args)
      for (const statement of statements) {
        if (statement[0] === "let" && statement[1] === "await") {
          assert(statement.length === 3, `\`await\` takes 1 argument; got ${statement.length - 1}`)
          const returnValue = await interpretThyExpression(helper.context, statement[2]).target
          if (returnValue !== undefined) {
            return returnValue
          }
          continue
        }

        const [shouldReturn, value] = helper.evaluateStatement(statement)
        if (shouldReturn) {
          return value
        } else {
          if (value instanceof Promise) {
            await value
          }
        }
      }
      return helper.formulateResult()
    }
  }

  return (...args: readonly unknown[]) => {
    const helper = makeHelper(args)
    for (const statement of statements) {
      const [shouldReturn, value] = helper.evaluateStatement(statement)
      if (shouldReturn) {
        return value
      }
    }
    return helper.formulateResult()
  }
}

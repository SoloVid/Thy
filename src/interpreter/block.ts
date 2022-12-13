import assert from "node:assert"
import { interpretThyCall } from "./call"
import { interpretThyExpression } from "./expression"
import { splitThyStatements } from "./split-statements"
import { interpretThyStatement } from "./statement"
import type { ThyBlockContext } from "./types"

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
  return (...args: readonly unknown[]) => {
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
    for (const statement of statements) {
      const parts = statement
      if (parts.length > 0) {
        if (parts[0] === "return") {
          assert(parts.length === 2, `\`return\` takes exactly one parameter`)
          return interpretThyExpression(context, parts[1])
        }
        if (parts[0] === "let") {
          assert(parts.length > 1, `\`let\` requires a function call following it`)
          const [letKeyword, ...theRest] = parts
          const returnValue = interpretThyCall(context, theRest)
          if (returnValue !== undefined) {
            return returnValue
          }
          continue
        }

        interpretThyStatement(context, parts)
      }
    }
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
}

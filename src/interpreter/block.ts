import assert from "node:assert"
import { interpretThyExpression } from "./expression"
import { splitThyStatements } from "./split-statements"
import { interpretThyStatement } from "./statement"
import type { ThyBlockContext } from "./types"

export function interpretThyBlock(thySource: string): (...args: readonly unknown[]) => unknown {
  const lines = thySource.split(/\r\n|\n/)
  return interpretThyBlockLines(lines)
}

export function interpretThyBlockLines(thySourceLines: readonly string[]): (...args: readonly unknown[]) => unknown {
  return (...args: readonly unknown[]) => {
    const context: ThyBlockContext = {
      argsToUse: [...args],
      implicitArguments: args.length > 0 && typeof args[0] === "object" && !!args[0] ? args[0] as Record<string, unknown> : null,
      variablesInBlock: {},
      variableIsImmutable: {},
    }
    const statements = splitThyStatements(thySourceLines)
    for (const statement of statements) {
      const parts = statement
      if (parts.length > 0) {
        if (parts[0] === "return") {
          assert(parts.length === 2, `return takes exactly one parameter`)
          return interpretThyExpression(context, parts[1])
        }

        interpretThyStatement(context, parts)
      }
    }
  }
}

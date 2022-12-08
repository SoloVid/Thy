import assert from "node:assert"
import { interpretThyBlockLines } from "./block"
import { numberRegex, stringRegex } from "./patterns"
import type { Atom, ThyBlockContext } from "./types"

export function interpretThyExpression(context: ThyBlockContext, thyExpression: Atom): unknown {
  if (Array.isArray(thyExpression)) {
    return interpretThyBlockLines(thyExpression)
  }
  assert(typeof thyExpression === "string", "Array case should have been filtered")

  if (numberRegex.test(thyExpression)) {
    return parseFloat(thyExpression)
  }
  const stringMatch = stringRegex.exec(thyExpression)
  if (stringMatch !== null) {
    return stringMatch[1]
  }
  if (context.implicitArguments && thyExpression in context.implicitArguments) {
    return context.implicitArguments[thyExpression]
  }
  if (thyExpression in context.variablesInBlock) {
    return context.variablesInBlock[thyExpression]
  }
  throw new Error(`Variable ${thyExpression} not found`)
}

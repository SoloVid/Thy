import assert from "node:assert"
import { interpretThyExpression } from "./expression"
import type { ThyBlockContext } from "./types"

export function interpretThyCall(context: ThyBlockContext, parts: readonly string[]): unknown {
  const [functionExpression, ...callArgExpressions] = parts

  if (functionExpression === "given") {
    assert(callArgExpressions.length <= 1, "given may only take one argument")
    return context.argsToUse.shift()
  }

  const callArgs = callArgExpressions.map(a => interpretThyExpression(context, a))
  const f = interpretThyExpression(context, functionExpression) as (...args: readonly unknown[]) => unknown
  assert(typeof f === "function", `${functionExpression} is not a function: ${JSON.stringify(f)}`)
  return f(...callArgs)
}

import assert from "node:assert"
import { interpretThyExpression } from "./expression"
import type { Atom, ThyBlockContext } from "./types"

export function interpretThyCall(context: ThyBlockContext, parts: readonly Atom[]): unknown {
  const [functionExpression, ...callArgExpressions] = parts

  if (functionExpression === "given") {
    if (context.implicitArgumentFirstUsed !== null) {
      throw new Error(`\`given\` cannot be used after implicit arguments are used. (${context.implicitArgumentFirstUsed} referenced implicit argument.)`)
    }
    context.givenUsed = true
    assert(callArgExpressions.length <= 1, "given may only take one argument")
    if (callArgExpressions.length === 1) {
      const defaultValue = interpretThyExpression(context, callArgExpressions[0])
      if (context.argsToUse.length === 0) {
        return defaultValue
      }
    }
    assert(context.argsToUse.length > 0, `No argument or default available for given`)
    return context.argsToUse.shift()
  }

  const callArgs = callArgExpressions.map(a => interpretThyExpression(context, a))
  const f = interpretThyExpression(context, functionExpression) as (...args: readonly unknown[]) => unknown
  assert(typeof f === "function", `${functionExpression} is not a function: ${JSON.stringify(f)}`)
  return f(...callArgs)
}

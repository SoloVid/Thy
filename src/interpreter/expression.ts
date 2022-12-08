import assert from "node:assert"
import { interpretThyBlockLines } from "./block"
import { identifierRegex, numberRegex, stringRegex } from "./patterns"
import type { Atom, ThyBlockContext } from "./types"

export function interpretThyExpression(context: ThyBlockContext, thyExpression: Atom): unknown {
  if (Array.isArray(thyExpression)) {
    return interpretThyBlockLines(thyExpression, { ...context.variablesInBlock, ...context.implicitArguments, ...context.closure })
  }
  assert(typeof thyExpression === "string", "Array case should have been filtered")

  if (numberRegex.test(thyExpression)) {
    return parseFloat(thyExpression)
  }
  const stringMatch = stringRegex.exec(thyExpression)
  if (stringMatch !== null) {
    return stringMatch[1]
  }
  return resolveNamedAccess(context, thyExpression)
}

function resolveNamedAccess(context: ThyBlockContext, thyExpression: string) {
  const parts = thyExpression.split(".")
  const [base, ...memberAccesses] = parts
  const baseValue = getVariableFromContext(context, base)
  let priorAccess = base
  let finalValue = baseValue
  for (const access of memberAccesses) {
    assert.match(access, identifierRegex, `Invalid (member) identifier: ${access}`)
    assert(!!finalValue, `Cannot access ${access} on ${priorAccess} because ${priorAccess} has no value`)
    finalValue = (finalValue as Record<string, unknown>)[access]
    priorAccess = access
  }
  return finalValue
}

function getVariableFromContext(context: ThyBlockContext, variable: string) {
  assert.match(variable, identifierRegex, `Invalid identifier: ${variable}`)

  if (context.implicitArguments && variable in context.implicitArguments) {
    assert(!context.givenUsed, `Implicit arguments cannot be used (referenced ${variable}) after \`given\``)
    if (context.implicitArgumentFirstUsed === null) {
      context.implicitArgumentFirstUsed = variable
    }
    return context.implicitArguments[variable]
  }
  if (variable in context.closure) {
    return context.closure[variable]
  }
  if (variable in context.variablesInBlock) {
    return context.variablesInBlock[variable]
  }
  throw new Error(`Variable ${variable} not found`)
}

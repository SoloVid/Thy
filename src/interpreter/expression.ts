import assert from "../utils/assert"
import { interpretThyBlockLines } from "./block"
import { identifierRegex, numberRegex, stringRegex } from "./patterns"
import type { Atom, ThyBlockContext } from "./types"

export function interpretThyExpression(context: ThyBlockContext, thyExpression: Atom): unknown {
  if (Array.isArray(thyExpression)) {
    return resolveBlock(context, thyExpression)
  }
  assert(typeof thyExpression === "string", "Array case should have been filtered")

  if (thyExpression === "that") {
    return interpretThat(context, "thatValue", "that")
  }
  if (thyExpression === "beforeThat") {
    return interpretThat(context, "beforeThatValue", "beforeThat")
  }

  if (numberRegex.test(thyExpression)) {
    return parseFloat(thyExpression)
  }
  const stringMatch = stringRegex.exec(thyExpression)
  if (stringMatch !== null) {
    return stringMatch[1]
  }
  return resolveNamedAccess(context, thyExpression)
}

function resolveBlock(context: ThyBlockContext, thyLines: readonly string[]) {
  const childClosure: ThyBlockContext["closure"] = { ...context.implicitArguments }
  const childClosureVariableIsImmutable: Record<string, boolean> = {}
  for (const key of Object.keys(context.variablesInBlock)) {
    Object.defineProperty(childClosure, key, {
      get() {
        return context.variablesInBlock[key]
      },
      set(value) {
        assert(!context.variableIsImmutable[key], `${key} is immutable and cannot be reassigned`)
        context.variablesInBlock[key] = value
      }
    })
    if (key in context.variableIsImmutable) {
      childClosureVariableIsImmutable[key] = context.variableIsImmutable[key]
    }
  }
  for (const key of Object.keys(context.implicitArguments)) {
    childClosureVariableIsImmutable[key] = true
  }
  for (const key of Object.keys(context.closure)) {
    Object.defineProperty(childClosure, key, {
      get() {
        return context.closure[key]
      },
      set(value) {
        assert(!context.closureVariableIsImmutable[key], `${key} is immutable and cannot be reassigned`)
        context.closure[key] = value
      }
    })
    if (key in context.closureVariableIsImmutable) {
      childClosureVariableIsImmutable[key] = context.closureVariableIsImmutable[key]
    }
  }
  return interpretThyBlockLines(thyLines, { closure: childClosure, closureVariableIsImmutable: childClosureVariableIsImmutable })
}

function interpretThat(context: ThyBlockContext, contextKey: "thatValue" | "beforeThatValue", keyword: "that" | "beforeThat") {
  if (context[contextKey] === undefined) {
    throw new Error(`Value is not available for \`${keyword}\``)
  }
  return context[contextKey]
}

function resolveNamedAccess(context: ThyBlockContext, thyExpression: string) {
  const parts = thyExpression.split(".")
  const [base, ...memberAccesses] = parts
  const baseValue = getVariableFromContext(context, base)
  let priorAccess = base
  let finalValue = baseValue
  for (const access of memberAccesses) {
    assert(identifierRegex.test(access), `Invalid (member) identifier: ${access}`)
    assert(!!finalValue, `Cannot access ${access} on ${priorAccess} because ${priorAccess} has no value`)
    finalValue = (finalValue as Record<string, unknown>)[access]
    priorAccess = access
  }
  return finalValue
}

function getVariableFromContext(context: ThyBlockContext, variable: string) {
  assert(identifierRegex.test(variable), `Invalid identifier: ${variable}`)

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

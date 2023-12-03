import assert from "../utils/assert"
import { interpretThyBlockLines } from "./block"
import { makeInterpreterError } from "./interpreter-error"
import { exactNumberRegex, exactStringRegex, identifierRegex } from "./patterns"
import { interpolateString, parseString } from "./string"
import type { Atom, AtomSingle, ThyBlockContext, UnparsedBlock } from "./types"

type InterpretedExpression = {
  target: unknown
  thisValue?: unknown
}

const ie = (value: unknown): InterpretedExpression => ({ target: value })

export function interpretThyExpression(context: ThyBlockContext, thyExpressionAtom: Atom): InterpretedExpression {
  if ("lines" in thyExpressionAtom) {
    return ie(resolveBlock(context, thyExpressionAtom))
  }
  const thyExpressionString = thyExpressionAtom.text

  if (exactNumberRegex.test(thyExpressionString)) {
    return ie(parseFloat(thyExpressionString))
  }
  const stringMatch = exactStringRegex.exec(thyExpressionString)
  if (stringMatch !== null) {
    const rawString = parseString(stringMatch[0], thyExpressionAtom)
    return ie(interpolateString(context, rawString, thyExpressionAtom))
  }

  return interpretThyIdentifier(context, thyExpressionAtom)
}

function resolveBlock(context: ThyBlockContext, unparsedBlock: UnparsedBlock) {
  function initialize() {
    const childClosure: ThyBlockContext["closure"] = { ...context.implicitArguments }
    const childClosureVariableIsImmutable: Record<string, boolean> = {}
    for (const key of Object.keys(context.variablesInBlock)) {
      Object.defineProperty(childClosure, key, {
        enumerable: true,
        get() {
          return context.variablesInBlock[key]
        },
        set(value) {
          assert(!context.variableIsImmutable[key], `${key} is immutable and cannot be reassigned`)
          context.variablesInBlock[key] = value
        },
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
        enumerable: true,
        get() {
          return context.closure[key]
        },
        set(value) {
          assert(!context.closureVariableIsImmutable[key], `${key} is immutable and cannot be reassigned`)
          context.closure[key] = value
        },
      })
      if (key in context.closureVariableIsImmutable) {
        childClosureVariableIsImmutable[key] = context.closureVariableIsImmutable[key]
      }
    }
    return interpretThyBlockLines(unparsedBlock.lines, {
      closure: childClosure,
      closureVariableIsImmutable: childClosureVariableIsImmutable,
      sourceFile: context.sourceFile,
      startingLineIndex: unparsedBlock.lineIndex
    })
  }

  // Rather than immediately construct the function for the block lines,
  // we defer until first execution.
  // The primary problem this is intended to resolve is the one where
  // the full list of variables in childClosure is not known
  // until the parent block has finished evaluating.

  let cached: null | ((...args: readonly unknown[]) => unknown) = null
  return (...args: readonly unknown[]): unknown => {
    if (cached === null) {
      cached = initialize()
    }
    return cached(...args)
  }
}

export function interpretThyIdentifier(context: ThyBlockContext, thyExpression: AtomSingle): InterpretedExpression {
  const parts = thyExpression.text.split(".")
  const [base, ...memberAccesses] = parts
  const baseValue = interpretThyIdentifierBase(context, thyExpression, base)
  let priorAccess = base
  let thisValue = undefined
  let finalValue = baseValue
  for (const access of memberAccesses) {
    thisValue = finalValue
    if (!identifierRegex.test(access)) {
      throw makeInterpreterError(thyExpression, `Invalid (member) identifier: ${access}`)
    }
    if (!finalValue) {
      throw makeInterpreterError(thyExpression, `Cannot access ${access} on ${priorAccess} because ${priorAccess} has no value`)
    }
    finalValue = (finalValue as Record<string, unknown>)[access]
    priorAccess = access
  }
  return { target: finalValue, thisValue: thisValue }
}

function interpretThyIdentifierBase(context: ThyBlockContext, atom: AtomSingle, thyExpressionBase: string) {
  if (thyExpressionBase === "that") {
    return interpretThat(context, atom, "thatValue", "that")
  }
  if (thyExpressionBase === "beforeThat") {
    return interpretThat(context, atom, "beforeThatValue", "beforeThat")
  }

  return getVariableFromContext(context, atom, thyExpressionBase)
}

function interpretThat(context: ThyBlockContext, atom: AtomSingle, contextKey: "thatValue" | "beforeThatValue", keyword: "that" | "beforeThat") {
  if (context[contextKey] === undefined) {
    throw makeInterpreterError(atom, `Value is not available for \`${keyword}\``)
  }
  return context[contextKey]
}

function getVariableFromContext(context: ThyBlockContext, atom: AtomSingle, variable: string) {
  if (!identifierRegex.test(variable)) {
    throw makeInterpreterError(atom, `Invalid identifier: ${variable}`)
  }

  if (!context.givenUsed && context.implicitArguments && variable in context.implicitArguments) {
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
  if (context.givenUsed && context.implicitArguments && variable in context.implicitArguments) {
    throw makeInterpreterError(atom, `Implicit arguments cannot be used (referenced ${variable}) after \`given\``)
  }
  throw makeInterpreterError(atom, `Variable ${variable} not found`)
}

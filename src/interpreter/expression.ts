import type { Block, Expression, ValueIdentifier, ValuePropertyAccess } from "tree"
import { isCall } from "tree/call"
import assert from "../utils/assert"
import { interpretThyBlockNode } from "./block"
import { interpretThyCall } from "./call"
import { makeInterpreterNodeError } from "./interpreter-error"
import type { ThyBlockContext } from "./types"
import { interpretThyString } from "./string"

type InterpretedExpression = {
  target: unknown
  thisValue?: unknown
}

const ie = (value: unknown): InterpretedExpression => ({ target: value })

export function interpretThyExpression(
  context: ThyBlockContext,
  thyExpression: Expression,
): InterpretedExpression {
  if (thyExpression.type === "block") {
    return ie(resolveBlock(context, thyExpression))
  }
  if (thyExpression.type === "number-literal") {
    return ie(parseFloat(thyExpression.token.text))
  }
  if (thyExpression.type === "string-literal") {
    return ie(interpretThyString(context, thyExpression))
  }
  if (isCall(thyExpression)) {
    assert(thyExpression.type !== "await-call", "TODO: await-call not yet implemented")
    return ie(interpretThyCall(context, thyExpression))
  }
  return interpretThyIdentifier(context, thyExpression)
}

function resolveBlock(context: ThyBlockContext, block: Block) {
  function initialize() {
    const childClosure: ThyBlockContext["closure"] = {}
    for (const key of Object.keys(context.implicitArguments)) {
      Object.defineProperty(childClosure, key, {
        enumerable: true,
        get() {
          return context.implicitArguments[key]
        },
        set(value) {
          throw new Error(`${key} is an implicit argument and cannot be overwritten`)
        },
      })
    }
    for (const key of Object.keys(context.variablesInBlock)) {
      const isImmutable = context.symbolTable.getSymbolInfo(key)?.isConstant ?? false
      Object.defineProperty(childClosure, key, {
        enumerable: true,
        get() {
          return context.variablesInBlock[key]
        },
        set(value) {
          assert(
            !isImmutable,
            `${key} is immutable and cannot be reassigned`,
          )
          context.variablesInBlock[key] = value
        },
      })
    }
    for (const key of Object.keys(context.closure)) {
      Object.defineProperty(childClosure, key, {
        enumerable: true,
        get() {
          return context.closure[key]
        },
        set(value) {
          context.closure[key] = value
        },
      })
    }
    return interpretThyBlockNode(block, {
      closure: childClosure,
      sourceFile: context.sourceFile,
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

export function interpretThyIdentifier(
  context: ThyBlockContext,
  thyExpression: ValueIdentifier | ValuePropertyAccess,
): InterpretedExpression {
  if (thyExpression.type === "value-identifier") {
    const value = getVariableFromContext(context, thyExpression)
    return { target: value, thisValue: undefined }
  }
  const mostlyAccessed = interpretThyValuePropertyAccessExceptLeaf(context, thyExpression)
  return { target: (mostlyAccessed.base as Record<string, unknown>)[mostlyAccessed.lastAccess], thisValue: mostlyAccessed.base }
}

export function interpretThyValuePropertyAccessExceptLeaf(
  context: ThyBlockContext,
  thyExpression: ValuePropertyAccess,
) {
  const baseValue = interpretThyExpression(context, thyExpression.base).target
  let priorAccess = thyExpression.baseToken.text
  let finalValue = baseValue
  for (let i = 0; i < thyExpression.propertyAccesses.length - 1; i++) {
    const pa = thyExpression.propertyAccesses[i]
    const access = pa.propertyToken.text
    if (finalValue === undefined) {
      throw makeInterpreterNodeError(
        thyExpression,
        `Cannot access ${access} on ${priorAccess} because ${priorAccess} has no value`,
      )
    }
    finalValue = (finalValue as Record<string, unknown>)[access]
    priorAccess = access
  }
  const lastAccess = thyExpression.propertyAccesses[thyExpression.propertyAccesses.length - 1].propertyToken.text
  if (finalValue === undefined) {
    throw makeInterpreterNodeError(
      thyExpression,
      `Cannot access ${lastAccess} on ${priorAccess} because ${priorAccess} has no value`,
    )
  }
  return { base: finalValue, lastAccess }
}

function getVariableFromContext(
  context: ThyBlockContext,
  valueIdentifier: ValueIdentifier,
) {
  const variable = valueIdentifier.token.text
  if (
    !context.givenUsed &&
    context.implicitArguments &&
    variable in context.implicitArguments
  ) {
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
  if (
    context.givenUsed &&
    context.implicitArguments &&
    variable in context.implicitArguments
  ) {
    throw makeInterpreterNodeError(
      valueIdentifier,
      `Implicit arguments cannot be used (referenced ${variable}) after \`given\``,
    )
  }
  throw makeInterpreterNodeError(valueIdentifier, `Variable ${variable} not found`)
}

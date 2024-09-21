import type {
  Block,
  Expression,
  ValueIdentifier,
  ValuePropertyAccess,
} from "tree"
import { isCall } from "tree"
import assert from "utils/assert"
import { forwardWait, MayWait, NotWait, notWait } from "./async-helper"
import { interpretThyBlockNode } from "./block"
import { interpretThyCall } from "./call"
import {
  RuntimeFunction,
  RuntimeValue,
  yesIThinkThisIsRuntimeObject,
  yesThisValueIsForRuntime,
} from "./dynamic-type"
import { makeInterpreterNodeError } from "./interpreter-error"
import { interpretThyString } from "./string"
import type { ThyBlockContext } from "./types"

export type InterpretedExpression = {
  target: RuntimeValue
  thisValue?: RuntimeValue
}

const ie = (target: RuntimeValue): NotWait<InterpretedExpression> => ({
  wait: false,
  value: { target: target },
})

export function interpretThyExpression(
  context: ThyBlockContext,
  thyExpression: Expression,
): MayWait<InterpretedExpression> {
  if (thyExpression.type === "block") {
    return ie(resolveBlock(context, thyExpression))
  }
  if (thyExpression.type === "number-literal") {
    return ie(yesThisValueIsForRuntime(parseFloat(thyExpression.token.text)))
  }
  if (thyExpression.type === "string-literal") {
    return ie(
      yesThisValueIsForRuntime(interpretThyString(context, thyExpression)),
    )
  }
  if (isCall(thyExpression)) {
    const callResult = interpretThyCall(context, thyExpression)
    return forwardWait(callResult, (r) => ({ target: r }))
  }
  return interpretThyNamedExpression(context, thyExpression)
}

function resolveBlock(context: ThyBlockContext, block: Block): RuntimeValue {
  function initialize() {
    const childClosure: ThyBlockContext["closure"] = {}
    for (const key of Object.keys(context.implicitArguments)) {
      Object.defineProperty(childClosure, key, {
        enumerable: true,
        get() {
          return context.implicitArguments[key]
        },
        set(value) {
          throw new Error(
            `${key} is an implicit argument and cannot be overwritten`,
          )
        },
      })
    }
    for (const key of Object.keys(context.variablesInBlock)) {
      const isImmutable =
        context.symbolTable.getSymbolInfo(key)?.isConstant ?? false
      Object.defineProperty(childClosure, key, {
        enumerable: true,
        get() {
          return context.variablesInBlock[key]
        },
        set(value) {
          assert(!isImmutable, `${key} is immutable and cannot be reassigned`)
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

  let cached: null | RuntimeFunction = null
  const toReturn: RuntimeFunction = (...args) => {
    if (cached === null) {
      cached = initialize()
    }
    return cached(...args)
  }
  return yesThisValueIsForRuntime(toReturn)
}

export function interpretThyValueIdentifier(
  context: ThyBlockContext,
  thyExpression: ValueIdentifier,
): NotWait<InterpretedExpression> {
  const value = getVariableFromContext(context, thyExpression)
  return notWait({ target: value, thisValue: undefined })
}

export function interpretThyNamedExpression(
  context: ThyBlockContext,
  thyExpression: ValueIdentifier | ValuePropertyAccess,
): MayWait<InterpretedExpression> {
  if (thyExpression.type === "value-identifier") {
    return interpretThyValueIdentifier(context, thyExpression)
  }
  const mostlyAccessedResult = interpretThyValuePropertyAccessExceptLeaf(
    context,
    thyExpression,
  )
  return forwardWait(mostlyAccessedResult, (mostlyAccessed) => ({
    thisValue: mostlyAccessed.base,
    target: yesIThinkThisIsRuntimeObject(mostlyAccessed.base)[
      mostlyAccessed.lastAccess
    ],
  }))
}

export function interpretThyValuePropertyAccessExceptLeaf(
  context: ThyBlockContext,
  thyExpression: ValuePropertyAccess,
): MayWait<MostlyAccessed> {
  const baseValueResult = interpretThyExpression(context, thyExpression.base)
  return forwardWait(baseValueResult, (value) =>
    interpretThyValuePropertyAccessExceptLeafSync(thyExpression, value.target),
  )
}

type MostlyAccessed = {
  base: RuntimeValue
  lastAccess: string
}

export function interpretThyValuePropertyAccessExceptLeafSync(
  thyExpression: ValuePropertyAccess,
  baseValue: RuntimeValue,
): MostlyAccessed {
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
    finalValue = yesIThinkThisIsRuntimeObject(finalValue)[access]
    priorAccess = access
  }
  const lastAccess =
    thyExpression.propertyAccesses[thyExpression.propertyAccesses.length - 1]
      .propertyToken.text
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
): RuntimeValue {
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
  throw makeInterpreterNodeError(
    valueIdentifier,
    `Variable ${variable} not found`,
  )
}

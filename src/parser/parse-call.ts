import type { Expression } from "tree"
import type { CallableExpression, TypeExpression } from "tree/expression"
import assert from "utils/assert"
import { tAwait, tGiven, tReturn } from "../tokenizer/token-type"
import type {
  AwaitCall,
  Call,
  GivenCall,
  Return,
  ValueCall,
} from "../tree/call"
import { addNodeError, addTokenError, badParse, BadParse } from "./error"
import { getFirstToken } from "./helper"
import { parseCallArgs } from "./parse-call-arguments"
import {
  type IndeterminateExpression,
  parseIndeterminateValueExpression,
} from "./parse-expression"
import type { ParserState } from "./parser-state"
import { collapseThat } from "./that"

export function parseSpecialCallOrFallback<T>(
  state: ParserState,
  fallback: (state: ParserState) => T,
) {
  const firstToken = state.buffer.peekToken()

  if (firstToken.type === tAwait) {
    return parseAwaitCall(state)
  }
  if (firstToken.type === tGiven) {
    return parseGivenCall(state)
  }

  return fallback(state)
}

export function parseCall(state: ParserState): Call | BadParse {
  return parseSpecialCallOrFallback(state, parseValueCall)
}

export function parseValueCall(state: ParserState): ValueCall | BadParse {
  const indeterminateFunc = parseIndeterminateValueExpression(state)
  if (indeterminateFunc === badParse) return badParse
  return parseValueCallGivenTarget(state, indeterminateFunc)
}

export function parseValueCallGivenTarget(
  state: ParserState,
  target: IndeterminateExpression,
): ValueCall | BadParse {
  const args = parseCallArgs(state)
  if (args === badParse) return badParse

  const maybeCallableFunc = collapseThat(state, target)
  if (maybeCallableFunc === badParse) return badParse
  const func = ensureFuncCallable(state, maybeCallableFunc)
  if (func === badParse) return badParse

  return {
    type: "value-call",
    func: func,
    funcToken: getValueCallFuncToken(target),
    typeArgs: args.typeArgs,
    args: args.valueArgs,
    firstToken: getFirstToken(target),
    lastToken: args.lastToken,
  }
}

function getValueCallFuncToken(
  target: IndeterminateExpression,
): ValueCall["funcToken"] {
  if (target.type === "value-identifier") {
    return target.token
  }
  if (target.type === "that") {
    return target.token
  }
  if (target.type === "indeterminate-value-property-access") {
    return target.propertyAccesses[target.propertyAccesses.length - 1]
      .propertyToken
  }
  return null
}

function ensureFuncCallable(
  state: ParserState,
  expression: Expression,
): CallableExpression | BadParse {
  if (expression.type === "number-literal") {
    addNodeError(state, expression, "Number literals cannot be called")
    return badParse
  }
  if (expression.type === "string-literal") {
    addNodeError(state, expression, "String literals cannot be called")
    return badParse
  }
  return expression
}

function parseAwaitCall(state: ParserState): AwaitCall | BadParse {
  const awaitToken = state.buffer.consumeToken()
  assert(
    awaitToken.type === tAwait,
    `parseAwaitCall() should only be called if next token is "await"`,
  )
  const args = parseCallArgs(state)
  if (args === badParse) return badParse
  for (let i = 0; i < args.typeArgs.length; i++) {
    addNodeError(
      state,
      args.typeArgs[i],
      `"await" call should not receive any type arguments`,
    )
  }
  if (args.valueArgs.length === 0) {
    addTokenError(
      state,
      awaitToken,
      `"await" call should receive exactly one argument`,
    )
    return badParse
  }
  const validArgs = [args.valueArgs[0] as Expression] as const
  for (let i = 1; i < args.valueArgs.length; i++) {
    addNodeError(
      state,
      args.valueArgs[i],
      `"await" call should not receive more than one argument`,
    )
  }
  return {
    type: "await-call",
    func: {
      type: "await-atom",
      token: awaitToken,
    },
    typeArgs: [],
    args: validArgs,
    firstToken: awaitToken,
    lastToken: args.lastToken,
  }
}

function parseGivenCall(state: ParserState): GivenCall | BadParse {
  const givenToken = state.buffer.consumeToken()
  assert(
    givenToken.type === tGiven,
    `parseGivenCall() should only be called if next token is "given"`,
  )
  const args = parseCallArgs(state)
  if (args === badParse) return badParse
  const validTypeArgs =
    args.typeArgs.length > 0
      ? ([args.typeArgs[0] as TypeExpression] as const)
      : ([] as const)
  for (let i = 1; i < args.typeArgs.length; i++) {
    addNodeError(
      state,
      args.typeArgs[i],
      `"given" call should not receive more than one type argument`,
    )
  }
  const validArgs =
    args.valueArgs.length > 0
      ? ([args.valueArgs[0] as Expression] as const)
      : ([] as const)
  for (let i = 1; i < args.valueArgs.length; i++) {
    addNodeError(
      state,
      args.valueArgs[i],
      `"given" call should not receive more than one argument`,
    )
  }
  return {
    type: "given-call",
    func: {
      type: "given-atom",
      token: givenToken,
    },
    typeArgs: validTypeArgs,
    args: validArgs,
    firstToken: givenToken,
    lastToken: args.lastToken,
  }
}

export function parseReturn(state: ParserState): Return | BadParse {
  const returnToken = state.buffer.consumeToken()
  assert(
    returnToken.type === tReturn,
    `parseReturn() should only be called if next token is "return"`,
  )
  const args = parseCallArgs(state)
  if (args === badParse) return badParse
  const validTypeArgs =
    args.typeArgs.length > 0
      ? ([args.typeArgs[0] as TypeExpression] as const)
      : ([] as const)
  for (let i = 1; i < args.typeArgs.length; i++) {
    addNodeError(
      state,
      args.typeArgs[i],
      `"return" should not receive more than one type argument`,
    )
  }
  if (args.valueArgs.length === 0) {
    addTokenError(
      state,
      returnToken,
      `"return" should receive exactly one argument`,
    )
    return badParse
  }
  const validArgs = [args.valueArgs[0] as Expression] as const
  for (let i = 1; i < args.valueArgs.length; i++) {
    addNodeError(
      state,
      args.valueArgs[i],
      `"return" should not receive more than one argument`,
    )
  }
  return {
    type: "return",
    func: {
      type: "return-atom",
      token: returnToken,
    },
    typeArgs: validTypeArgs,
    args: validArgs,
    firstToken: returnToken,
    lastToken: args.lastToken,
  }
}

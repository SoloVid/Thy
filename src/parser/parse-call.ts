import type { SaferToken } from "tokenizer/token"
import type { Expression } from "tree"
import type { CallableExpression, TypeExpression } from "tree/expression"
import assert from "utils/assert"
import { tAwait, tGiven } from "../tokenizer/token-type"
import type { AwaitCall, Call, GivenCall, ValueCall } from "../tree/call"
import { addNodeError, addTokenError, nodeError } from "./error"
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

export function parseCall(state: ParserState): Call {
  return parseSpecialCallOrFallback(state, parseValueCall)
}

export function parseValueCall(state: ParserState): ValueCall {
  const indeterminateFunc = parseIndeterminateValueExpression(state)
  return parseValueCallGivenTarget(state, indeterminateFunc)
}

export function parseValueCallGivenTarget(
  state: ParserState,
  target: IndeterminateExpression,
): ValueCall {
  const args = parseCallArgs(state)
  const func = collapseThat(state, target)

  return {
    type: "value-call",
    func: ensureFuncCallable(state, func),
    typeArgs: args.typeArgs,
    args: args.valueArgs,
    firstToken: getFirstToken(target),
    lastToken: args.lastToken,
  }
}

function ensureFuncCallable(
  state: ParserState,
  expression: Expression,
): CallableExpression {
  if (expression.type === "number-literal") {
    return addNodeError(state, expression, "Number literals cannot be called")
  }
  if (expression.type === "string-literal") {
    return addNodeError(state, expression, "String literals cannot be called")
  }
  return expression
}

function parseAwaitCall(state: ParserState): AwaitCall {
  const awaitToken = state.buffer.consumeToken() as SaferToken<typeof tAwait>
  assert(
    awaitToken.type === tAwait,
    `parseAwaitCall() should only be called if next token is "await"`,
  )
  const args = parseCallArgs(state)
  for (let i = 0; i < args.typeArgs.length; i++) {
    state.addError(
      nodeError(
        args.typeArgs[i],
        `"await" call should not receive any type arguments`,
      ),
    )
  }
  const validArgs =
    args.valueArgs.length > 0
      ? ([args.valueArgs[0] as Expression] as const)
      : ([
          addTokenError(
            state,
            awaitToken,
            `"await" call should receive exactly one argument`,
          ),
        ] as const)
  for (let i = 1; i < args.valueArgs.length; i++) {
    state.addError(
      nodeError(
        args.valueArgs[i],
        `"await" call should not receive more than one argument`,
      ),
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

function parseGivenCall(state: ParserState): GivenCall {
  const givenToken = state.buffer.consumeToken() as SaferToken<typeof tGiven>
  assert(
    givenToken.type === tGiven,
    `parseGivenCall() should only be called if next token is "given"`,
  )
  const args = parseCallArgs(state)
  const validTypeArgs =
    args.typeArgs.length > 0
      ? ([args.typeArgs[0] as TypeExpression] as const)
      : ([] as const)
  for (let i = 1; i < args.typeArgs.length; i++) {
    state.addError(
      nodeError(
        args.typeArgs[i],
        `"given" call should not receive more than one type argument`,
      ),
    )
  }
  const validArgs =
    args.valueArgs.length > 0
      ? ([args.valueArgs[0] as Expression] as const)
      : ([] as const)
  for (let i = 1; i < args.valueArgs.length; i++) {
    state.addError(
      nodeError(
        args.valueArgs[i],
        `"given" call should not receive more than one argument`,
      ),
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

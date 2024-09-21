import type { TokenRange } from "common/token-range"
import type { Token } from "tokenizer"
import {
  tStatementContinuation,
  tStatementTerminator,
  tTypeGiven,
} from "tokenizer/token-type"
import type { TypeCall, TypeGivenCall } from "tree"
import assert from "utils/assert"
import { addNodeError, BadParse, badParse } from "./error"
import { getFirstToken, getLastToken } from "./helper"
import {
  parseSpecialCallOrFallback,
  parseValueCallGivenTarget,
} from "./parse-call"
import {
  IndeterminateExpression,
  IndeterminateTypeExpression,
  parseIndeterminateValueOrTypeExpression,
} from "./parse-expression"
import type { ParserState } from "./parser-state"
import { collapseThat, collapseThats } from "./that"

export function parseTypeCallOrValueCall(state: ParserState) {
  return parseSpecialCallOrFallback(state, () => {
    const firstToken = state.buffer.peekToken()
    if (firstToken.type === tTypeGiven) {
      return parseTypeGivenCall(state)
    }
    const func = parseIndeterminateValueOrTypeExpression(state)
    if (func === badParse) return badParse
    if (
      func.type === "indeterminate-type-property-access" ||
      func.type === "type-identifier"
    ) {
      return parseTypeCallGivenTarget(state, func)
    }
    return parseValueCallGivenTarget(state, func)
  })
}

export function parseTypeCallGivenTarget(
  state: ParserState,
  target: IndeterminateTypeExpression,
): TypeCall | BadParse {
  const args = parseTypeCallArgs(state)
  if (args === badParse) return badParse
  const func = collapseThat(state, target)
  if (func === badParse) return badParse
  return {
    type: "type-call" as const,
    func,
    args: args.args,
    firstToken: getFirstToken(target),
    lastToken: args.lastToken,
  }
}

interface Args extends TokenRange {
  args: TypeCall["args"]
}

export function parseTypeCallArgs(state: ParserState): Args | BadParse {
  const firstToken = state.buffer.peekToken()
  const indeterminateArgs: (
    | IndeterminateExpression
    | IndeterminateTypeExpression
  )[] = []

  let lastToken = firstToken
  while (state.buffer.peekToken().type !== tStatementTerminator) {
    const arg = parseIndeterminateValueOrTypeExpression(state)
    if (arg === badParse) return badParse
    lastToken = getLastToken(arg)

    indeterminateArgs.push(arg)

    while (state.buffer.peekToken().type === tStatementContinuation) {
      state.buffer.consumeToken()
    }
  }

  const terminator = state.buffer.consumeToken()
  assert(
    terminator.type === tStatementTerminator,
    "The only token that should have broken the loop is a statement terminator",
  )

  const args = collapseThats(state, indeterminateArgs)
  if (args === badParse) return badParse

  return {
    args,
    firstToken: firstToken,
    lastToken: lastToken,
  }
}

function parseTypeGivenCall(state: ParserState): TypeGivenCall | BadParse {
  const givenToken = state.buffer.consumeToken() as Token<typeof tTypeGiven>
  assert(
    givenToken.type === tTypeGiven,
    `parseTypeGivenCall() should only be called if next token is "Given"`,
  )
  const args = parseTypeCallArgs(state)
  if (args === badParse) return badParse
  for (let i = 2; i < args.args.length; i++) {
    addNodeError(
      state,
      args.args[i],
      `"Given" call should not receive more than two arguments`,
    )
  }
  return {
    type: "type-given-call",
    func: {
      type: "type-given-atom",
      token: givenToken,
    },
    // TODO: Why is this a type error?
    args: args.args.slice(0, 2) as unknown as TypeGivenCall["args"],
    firstToken: givenToken,
    lastToken: args.lastToken,
  }
}

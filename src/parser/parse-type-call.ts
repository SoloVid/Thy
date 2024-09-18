import {
  tStatementContinuation,
  tStatementTerminator,
  tTypeGiven,
} from "tokenizer/token-type"
import { TokenRange } from "tree"
import assert from "utils/assert"
import type { TypeCall, TypeGivenCall } from "../tree/type-call"
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
import { SaferToken } from "tokenizer/token"
import { nodeError } from "./error"

export function parseTypeCallOrValueCall(state: ParserState) {
  return parseSpecialCallOrFallback(state, () => {
    const firstToken = state.buffer.peekToken()
    if (firstToken.type === tTypeGiven) {
      return parseTypeGivenCall(state)
    }
    const func = parseIndeterminateValueOrTypeExpression(state)
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
): TypeCall {
  const args = parseTypeCallArgs(state)
  return {
    type: "type-call" as const,
    func: collapseThat(state, target),
    args: args.args,
    firstToken: getFirstToken(target),
    lastToken: args.lastToken,
  }
}

interface Args extends TokenRange {
  args: TypeCall["args"]
}

export function parseTypeCallArgs(state: ParserState): Args {
  const firstToken = state.buffer.peekToken()
  const args: (IndeterminateExpression | IndeterminateTypeExpression)[] = []

  let lastToken = firstToken
  while (state.buffer.peekToken().type !== tStatementTerminator) {
    const arg = parseIndeterminateValueOrTypeExpression(state)
    lastToken = getLastToken(arg)

    args.push(arg)

    while (state.buffer.peekToken().type === tStatementContinuation) {
      state.buffer.consumeToken()
    }
  }

  const terminator = state.buffer.consumeToken()
  assert(
    terminator.type === tStatementTerminator,
    "The only token that should have broken the loop is a statement terminator",
  )

  return {
    args: collapseThats(state, args),
    firstToken: firstToken,
    lastToken: lastToken,
  }
}

function parseTypeGivenCall(state: ParserState): TypeGivenCall {
  const givenToken = state.buffer.consumeToken() as SaferToken<
    typeof tTypeGiven
  >
  assert(
    givenToken.type === tTypeGiven,
    `parseTypeGivenCall() should only be called if next token is "Given"`,
  )
  const args = parseTypeCallArgs(state)
  for (let i = 2; i < args.args.length; i++) {
    state.addError(
      nodeError(
        args.args[i],
        `"Given" call should not receive more than two arguments`,
      ),
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

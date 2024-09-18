import {
  tStatementContinuation,
  tStatementTerminator,
} from "tokenizer/token-type"
import { TokenRange } from "tree"
import assert from "utils/assert"
import type { TypeCall } from "../tree/type-call"
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

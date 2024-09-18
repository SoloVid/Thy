import assert from "utils/assert"
import {
  tStatementContinuation,
  tStatementTerminator,
} from "../tokenizer/token-type"
import type { Call } from "../tree/call"
import { addNodeError } from "./error"
import {
  IndeterminateExpression,
  IndeterminateTypeExpression,
  parseIndeterminateValueOrTypeExpression,
} from "./parse-expression"
import type { ParserState } from "./parser-state"
import { collapseThats } from "./that"
import { TokenRange } from "tree"
import { getLastToken } from "./helper"

export interface Args extends TokenRange {
  typeArgs: Call["typeArgs"]
  valueArgs: Call["args"]
}

export function parseCallArgs(state: ParserState): Args {
  const firstToken = state.buffer.peekToken()
  const typeArgs: IndeterminateTypeExpression[] = []
  const args: IndeterminateExpression[] = []

  let lastToken = firstToken
  let typeArgumentsEnded = false
  while (state.buffer.peekToken().type !== tStatementTerminator) {
    const arg = parseIndeterminateValueOrTypeExpression(state)
    lastToken = getLastToken(arg)

    if (
      arg.type !== "type-identifier" &&
      arg.type !== "indeterminate-type-property-access"
    ) {
      typeArgumentsEnded = true
      args.push(arg)
    } else {
      if (!typeArgumentsEnded) {
        typeArgs.push(arg)
      } else {
        args.push(
          addNodeError(
            state,
            arg,
            `Unexpected type argument in value argument list`,
          ),
        )
      }
    }

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
    typeArgs: collapseThats(state, typeArgs),
    valueArgs: collapseThats(state, args),
    firstToken: firstToken,
    lastToken: lastToken,
  }
}

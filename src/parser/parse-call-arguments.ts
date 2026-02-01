import { TokenRange } from "common"
import assert from "utils/assert.ts"
import {
  tStatementContinuation,
  tStatementTerminator,
} from "../tokenizer/token-type.ts"
import type { Call } from "../tree/call.ts"
import { addNodeError, BadParse, badParse } from "./error.ts"
import { getLastToken } from "./helper.ts"
import {
  IndeterminateExpression,
  IndeterminateTypeExpression,
  parseIndeterminateValueOrTypeExpression,
} from "./parse-expression.ts"
import type { ParserState } from "./parser-state.ts"
import { collapseThats } from "./that.ts"

export interface Args extends TokenRange {
  typeArgs: Call["typeArgs"]
  valueArgs: Call["args"]
}

export function parseCallArgs(state: ParserState): Args | BadParse {
  const firstToken = state.buffer.peekToken()
  const indeterminateTypeArgs: IndeterminateTypeExpression[] = []
  const indeterminateValueArgs: IndeterminateExpression[] = []

  let lastToken = firstToken
  let typeArgumentsEnded = false
  while (state.buffer.peekToken().type !== tStatementTerminator) {
    const arg = parseIndeterminateValueOrTypeExpression(state)
    if (arg === badParse) return badParse
    lastToken = getLastToken(arg)

    if (
      arg.type !== "type-identifier" &&
      arg.type !== "indeterminate-type-property-access"
    ) {
      typeArgumentsEnded = true
      indeterminateValueArgs.push(arg)
    } else {
      if (!typeArgumentsEnded) {
        indeterminateTypeArgs.push(arg)
      } else {
        addNodeError(
          state,
          arg,
          `Unexpected type argument in value argument list`,
        )
        return badParse
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

  const valueArgs = collapseThats(state, indeterminateValueArgs)
  if (valueArgs === badParse) return badParse
  const typeArgs = collapseThats(state, indeterminateTypeArgs)
  if (typeArgs === badParse) return badParse

  return {
    typeArgs,
    valueArgs,
    firstToken: firstToken,
    lastToken: lastToken,
  }
}

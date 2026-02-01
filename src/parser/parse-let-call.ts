import { tLet, tStatementTerminator } from "tokenizer/token-type.ts"
import type { LetCall } from "tree"
import assert from "utils/assert.ts"
import { BadParse, badParse } from "./error.ts"
import { parseCall } from "./parse-call.ts"
import type { ParserState } from "./parser-state.ts"

export function parseLetCall(state: ParserState): LetCall | BadParse {
  const letToken = state.buffer.consumeToken()
  assert(
    letToken.type === tLet,
    "parseLetCall() should only be called if next token is let",
  )
  const nextToken = state.buffer.peekToken()
  if (nextToken.type === tStatementTerminator) {
    state.buffer.consumeToken()
    return {
      type: "let-call",
      letToken: letToken,
      call: null,
      firstToken: letToken,
      lastToken: letToken,
    }
  }
  const call = parseCall(state)
  if (call === badParse) return badParse
  return {
    type: "let-call",
    letToken: letToken,
    call,
    firstToken: letToken,
    lastToken: call.lastToken,
  }
}

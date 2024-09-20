import assert from "utils/assert"
import { tLet, tStatementTerminator } from "../tokenizer/token-type"
import type { LetCall } from "../tree/let-call"
import { parseCall } from "./parse-call"
import type { ParserState } from "./parser-state"
import { badParse, BadParse } from "./error"

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

import assert from "utils/assert"
import { tLet } from "../tokenizer/token-type"
import type { LetCall } from "../tree/let-call"
import { parseCall } from "./parse-call"
import type { ParserState } from "./parser-state"
import type { SaferToken } from "tokenizer/token"

export function parseLetCall(state: ParserState): LetCall {
  const letToken = state.buffer.consumeToken()
  assert(
    letToken.type === tLet,
    "parseLetCall() should only be called if next token is let",
  )
  const call = parseCall(state)
  return {
    type: "let-call",
    letToken: letToken as SaferToken<typeof tLet>,
    call,
    firstToken: letToken,
    lastToken: call.lastToken,
  }
}

import { tokenError } from "compile-error"
import { tComment, tStatementTerminator } from "tokenizer/token-type"
import type { Comment } from "tree"
import assert from "utils/assert"
import type { ParserState } from "./parser-state"

export function parseComment(state: ParserState): Comment {
  const commentToken = state.buffer.consumeToken()
  assert(
    commentToken.type === tComment,
    "parseComment() should only be called when next token is a comment",
  )
  const terminatorToken = state.buffer.peekToken()
  if (terminatorToken.type === tStatementTerminator) {
    state.buffer.consumeToken()
  } else {
    state.addError(tokenError(terminatorToken, "Expected statement terminator"))
  }
  return {
    type: "comment",
    token: commentToken,
  }
}

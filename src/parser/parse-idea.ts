import type { SaferToken } from "../tokenizer/token"
import {
  tComment,
  tExport,
  tLet,
  tPrivate,
  tStatementTerminator,
  tType,
} from "../tokenizer/token-type"
import type { Idea } from "../tree"
import {
  parseAssignmentOrCall,
  parseModifiedAssignment,
} from "./parse-assignment-or-call"
import { parseComment } from "./parse-comment"
import { parseLetCall } from "./parse-let-call"
import { parseTypeAssignment } from "./parse-type-assignment"
import type { ParserState } from "./parser-state"

export function parseIdea(state: ParserState): Idea {
  const nextToken = state.buffer.peekToken()
  if (nextToken.type === tComment) {
    return parseComment(state)
  }
  if (nextToken.type === tStatementTerminator) {
    state.buffer.consumeToken()
    return {
      type: "blank-line",
      token: nextToken as SaferToken<typeof tStatementTerminator>,
    }
  }
  if ([tExport, tPrivate].includes(nextToken.type)) {
    return parseModifiedAssignment(state)
  }
  if (nextToken.type === tType) {
    return parseTypeAssignment(state, null)
  }
  if (nextToken.type === tLet) {
    return parseLetCall(state)
  }

  return parseAssignmentOrCall(state, null)
}

export function isIdeaAsync(idea: Idea) {
  return (
    idea.type === "await-call" ||
    (idea.type === "assignment" && idea.call.type === "await-call")
  )
}

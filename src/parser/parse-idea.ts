import { isAssignment } from "tree/assignment"
import {
  tComment,
  tExport,
  tLet,
  tPrivate,
  tReturn,
  tStatementTerminator,
  tType,
} from "../tokenizer/token-type"
import type { Idea } from "../tree"
import {
  parseAssignmentOrCall,
  parseModifiedAssignment,
} from "./parse-assignment-or-call"
import { parseReturn } from "./parse-call"
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
      token: nextToken,
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
  if (nextToken.type === tReturn) {
    return parseReturn(state)
  }

  return parseAssignmentOrCall(state, null)
}

export function isIdeaAsync(idea: Idea) {
  return (
    idea.type === "await-call" ||
    (isAssignment(idea) && idea.call.type === "await-call") ||
    (idea.type === "let-call" && idea.call?.type === "await-call")
  )
}

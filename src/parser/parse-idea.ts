import {
  tComment,
  tEndStream,
  tExport,
  tLet,
  tPrivate,
  tReturn,
  tStatementTerminator,
  tType,
} from "tokenizer/token-type.ts"
import type { Idea } from "tree"
import { badParse, BadParse } from "./error.ts"
import {
  parseAssignmentOrCall,
  parseModifiedAssignment,
} from "./parse-assignment-or-call.ts"
import { parseReturn } from "./parse-call.ts"
import { parseComment } from "./parse-comment.ts"
import { parseLetCall } from "./parse-let-call.ts"
import { parseTypeAssignment } from "./parse-type-assignment.ts"
import type { ParserState } from "./parser-state.ts"

export function parseIdea(state: ParserState): Idea {
  const result = parseIdeaUntilBadParse(state)
  if (result !== badParse) {
    return result
  }

  let previousToken = state.buffer.getPreviousToken()
  // Munch all the tokens up to the next statement terminator.
  while (![tStatementTerminator, tEndStream].includes(previousToken.type)) {
    previousToken = state.buffer.consumeToken()
  }
  return {
    type: "comment",
    token: {
      ...previousToken,
      type: tComment,
      text: `Error parsing this line (this comment is replacing the line)`,
    },
  }
}

function parseIdeaUntilBadParse(state: ParserState): Idea | BadParse {
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

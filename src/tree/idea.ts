import type { Token } from "tokenizer/token.ts"
import type { tComment, tStatementTerminator } from "tokenizer/token-type.ts"
import { isAssignment, type Assignment } from "./assignment.ts"
import type { Call, Return } from "./call.ts"
import type { TypeReturn } from "./type-call.ts"
import type { LetCall } from "./let-call.ts"
import type { TypeAssignment } from "./type-assignment.ts"

export interface BlankLine {
  readonly type: "blank-line"
  readonly token: Token<typeof tStatementTerminator>
}

export interface Comment {
  readonly type: "comment"
  readonly token: Token<typeof tComment>
}

export type Idea =
  | BlankLine
  | Comment
  | Call
  | Return
  | TypeReturn
  | LetCall
  | Assignment
  | TypeAssignment

export function isIdeaAsync(idea: Idea) {
  return (
    idea.type === "await-call" ||
    (isAssignment(idea) && idea.call.type === "await-call") ||
    (idea.type === "let-call" && idea.call?.type === "await-call")
  )
}

export function hasIdeaGiven(idea: Idea) {
  return (
    idea.type === "given-call" ||
    (isAssignment(idea) && idea.call.type === "given-call") ||
    (idea.type === "let-call" && idea.call?.type === "given-call")
  )
}

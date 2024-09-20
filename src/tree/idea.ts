import type { Token } from "tokenizer/token"
import type { tComment, tStatementTerminator } from "tokenizer/token-type"
import type { Assignment } from "./assignment"
import type { Call, Return } from "./call"
import type { LetCall } from "./let-call"
import type { TypeAssignment } from "./type-assignment"

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
  | Assignment
  | TypeAssignment
  | LetCall

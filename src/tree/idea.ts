import type { SaferToken } from "tokenizer/token"
import type { tComment, tStatementTerminator } from "tokenizer/token-type"
import type { Assignment } from "./assignment"
import type { Call, Return } from "./call"
import type { LetCall } from "./let-call"
import type { TypeAssignment } from "./type-assignment"

export interface BlankLine {
  type: "blank-line"
  token: SaferToken<typeof tStatementTerminator>
}

export interface Comment {
  type: "comment"
  token: SaferToken<typeof tComment>
}

export type Idea =
  | BlankLine
  | Comment
  | Call
  | Return
  | Assignment
  | TypeAssignment
  | LetCall

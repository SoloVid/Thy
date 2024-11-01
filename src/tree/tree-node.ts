import type { Assignment } from "./assignment"
import type { Block } from "./block"
import type { Call, Return } from "./call"
import type { TypeReturn } from "./type-call"
import type { BlankLine, Comment } from "./idea"
import type { LetCall } from "./let-call"
import type { TypePropertyAccess, ValuePropertyAccess } from "./property-access"
import type { StringInterpolation, StringLiteral } from "./string"
import type {
  AwaitTerm,
  GivenTerm,
  NumberLiteral,
  ReturnTerm,
  TypeGivenTerm,
  TypeIdentifier,
  ValueIdentifier,
} from "./term"
import type { TypeAssignment } from "./type-assignment"
import type { TypeCall, TypeGivenCall } from "./type-call"

export type TreeNode =
  | Assignment
  | BlankLine
  | Comment
  | Block
  | Call
  | Return
  | TypeReturn
  | NumberLiteral
  | StringLiteral
  | StringInterpolation
  | ValuePropertyAccess
  | TypePropertyAccess
  | TypeAssignment
  | TypeCall
  | TypeGivenCall
  | LetCall
  | AwaitTerm
  | GivenTerm
  | ReturnTerm
  | TypeGivenTerm
  | TypeIdentifier
  | ValueIdentifier

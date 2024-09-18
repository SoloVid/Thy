import type { Assignment } from "./assignment"
import type {
  AwaitAtom,
  GivenAtom,
  NumberLiteral,
  ReturnAtom,
  TypeGivenAtom,
  TypeIdentifier,
  ValueIdentifier,
} from "./atom"
import type { Block } from "./block"
import type { Call, Return } from "./call"
import { ErrorValue } from "./error"
import type { BlankLine, Comment } from "./idea"
import type { LetCall } from "./let-call"
import type { TypePropertyAccess, ValuePropertyAccess } from "./property-access"
import { StringLiteral } from "./string"
import type { TypeAssignment } from "./type-assignment"
import type { TypeCall } from "./type-call"

export type TreeNode =
  | Assignment
  | BlankLine
  | Comment
  | Block
  | Call
  | Return
  | NumberLiteral
  | StringLiteral
  | ValuePropertyAccess
  | TypePropertyAccess
  | TypeAssignment
  | TypeCall
  | LetCall
  | AwaitAtom
  | GivenAtom
  | ReturnAtom
  | TypeGivenAtom
  | TypeIdentifier
  | ValueIdentifier
  | ErrorValue

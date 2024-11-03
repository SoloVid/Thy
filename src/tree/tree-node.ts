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
  // Ordered from simplest to most complex.
  // (Order is intended to match code generator.)
  | BlankLine
  | Comment
  | NumberLiteral
  | StringLiteral
  | ValueIdentifier
  | ValuePropertyAccess
  | TypeIdentifier
  | TypePropertyAccess
  | Call
  | TypeCall
  | TypeGivenCall
  | Return
  | TypeReturn
  | LetCall
  | Assignment
  | TypeAssignment
  | Block
  // These remaining types probably don't have dedicated generators.
  | AwaitTerm
  | GivenTerm
  | TypeGivenTerm
  | ReturnTerm
  | StringInterpolation

/** Subset of {@link TreeNode} that can be used in type context. */
export type TypedTreeNode =
  // Ordered to match TreeNode
  | NumberLiteral
  | StringLiteral
  | ValueIdentifier
  | ValuePropertyAccess
  | TypeIdentifier
  | TypePropertyAccess
  | Call
  | TypeCall
  | TypeGivenCall
  | Block

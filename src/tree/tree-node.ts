import type { Assignment } from "./assignment.ts"
import type { Block } from "./block.ts"
import type { Call, Return } from "./call.ts"
import type { BlankLine, Comment } from "./idea.ts"
import type { LetCall } from "./let-call.ts"
import type { TypePropertyAccess, ValuePropertyAccess } from "./property-access.ts"
import type { StringInterpolation, StringLiteral } from "./string.ts"
import type {
  AwaitTerm,
  GivenTerm,
  NumberLiteral,
  ReturnTerm,
  ThyTerm,
  TypeGivenTerm,
  TypeIdentifier,
  ValueIdentifier,
} from "./term.ts"
import type { TypeAssignment } from "./type-assignment.ts"
import type { TypeCall, TypeGivenCall, TypeReturn } from "./type-call.ts"

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
  | ThyTerm
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

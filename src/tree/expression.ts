import type { NumberLiteral, TypeIdentifier, ValueIdentifier } from "./term.ts"
import type { Block } from "./block.ts"
import type { Call } from "./call.ts"
import type {
  TypePropertyAccess,
  ValuePropertyAccess,
} from "./property-access.ts"
import type { StringLiteral } from "./string.ts"

export type CallableExpression =
  | Block
  | Call
  | ValueIdentifier
  | ValuePropertyAccess

export type Expression = CallableExpression | NumberLiteral | StringLiteral

export type TypeExpression = TypeIdentifier | TypePropertyAccess

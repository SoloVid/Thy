import type { NumberLiteral, TypeIdentifier, ValueIdentifier } from "./term"
import type { Block } from "./block"
import type { Call } from "./call"
import type { TypePropertyAccess, ValuePropertyAccess } from "./property-access"
import type { StringLiteral } from "./string"

export type CallableExpression =
  | Block
  | Call
  | ValueIdentifier
  | ValuePropertyAccess

export type Expression = CallableExpression | NumberLiteral | StringLiteral

export type TypeExpression = TypeIdentifier | TypePropertyAccess

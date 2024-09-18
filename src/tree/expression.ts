import { NumberLiteral, TypeIdentifier, ValueIdentifier } from "./atom"
import type { Block } from "./block"
import { Call } from "./call"
import { ErrorValue } from "./error"
import { TypePropertyAccess, ValuePropertyAccess } from "./property-access"
import { StringLiteral } from "./string"

export type CallableExpression =
  | Block
  | Call
  | ErrorValue
  | ValueIdentifier
  | ValuePropertyAccess

export type Expression = CallableExpression | NumberLiteral | StringLiteral

export type TypeExpression = TypeIdentifier | TypePropertyAccess

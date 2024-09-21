import type { TokenRange } from "common/token-range"
import type { TypeGivenAtom } from "./atom"
import type { Expression, TypeExpression } from "./expression"

export interface TypeCall extends TokenRange {
  readonly type: "type-call"
  readonly func: TypeExpression
  readonly args: readonly (Expression | TypeExpression)[]
}

export interface TypeGivenCall extends TokenRange {
  readonly type: "type-given-call"
  readonly func: TypeGivenAtom
  readonly args:
    | readonly []
    | readonly [Expression | TypeExpression]
    | readonly [Expression | TypeExpression, Expression | TypeExpression]
}

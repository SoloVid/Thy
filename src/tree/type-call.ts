import type { TokenRange } from "common/token-range.ts"
import type { Expression, TypeExpression } from "./expression.ts"
import type { ReturnTerm, TypeGivenTerm } from "./term.ts"

export interface TypeCall extends TokenRange {
  readonly type: "type-call"
  readonly func: TypeExpression
  readonly args: readonly (Expression | TypeExpression)[]
}

export interface TypeGivenCall extends TokenRange {
  readonly type: "type-given-call"
  readonly func: TypeGivenTerm
  readonly args:
    | readonly []
    | readonly [Expression | TypeExpression]
    | readonly [Expression | TypeExpression, Expression | TypeExpression]
}

export interface TypeReturn extends TokenRange {
  readonly type: "type-return"
  readonly func: ReturnTerm
  readonly args: readonly [TypeExpression]
}

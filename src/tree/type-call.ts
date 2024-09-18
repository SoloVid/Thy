// import type { ReturnAtom } from "./atom"
import type { Expression, TypeExpression } from "./expression"
import type { TokenRange } from "./token-range"

export interface TypeCall extends TokenRange {
  type: "type-call"
  func: TypeExpression
  args: (Expression | TypeExpression)[]
}

// export interface TypeReturnCall extends TokenRange {
//   type: "type-return-call"
//   func: ReturnAtom
//   typeArgs: [] | [TypeExpression]
//   args: [] | [Expression]
// }

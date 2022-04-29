import type { Expression, TypeExpression } from "./expression";
import type { TokenRange } from "./token-range";

export interface TypeCall extends TokenRange {
    type: "type-call"
    func: Expression | TypeExpression
    args: (Expression | TypeExpression)[]
}

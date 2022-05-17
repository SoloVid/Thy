import type { Expression, TypeExpression } from "./expression";
import type { TokenRange } from "./token-range";

export interface Call extends TokenRange {
    type: "call"
    func: Expression
    typeArgs: TypeExpression[]
    args: Expression[]
}

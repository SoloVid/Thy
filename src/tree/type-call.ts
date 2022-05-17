import type { BaseTreeNode } from "./base-tree-node";
import type { Expression, TypeExpression } from "./expression";
import type { TokenRange } from "./token-range";

export interface TypeCall extends BaseTreeNode, TokenRange {
    type: "type-call"
    func: Expression | TypeExpression
    args: (Expression | TypeExpression)[]
}

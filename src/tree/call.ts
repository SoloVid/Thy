import type { BaseTreeNode } from "./base-tree-node";
import type { Expression, TypeExpression } from "./expression";
import type { TokenRange } from "./token-range";

export interface Call extends BaseTreeNode, TokenRange {
    type: "call"
    func: Expression
    typeArgs: TypeExpression[]
    args: Expression[]
}

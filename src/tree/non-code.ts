import type { Token } from "../tokenizer/token";
import type { BaseTreeNode } from "./base-tree-node";

export interface NonCode extends BaseTreeNode {
    type: "non-code"
    token: Token
}
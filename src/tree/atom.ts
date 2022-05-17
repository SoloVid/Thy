import type { Token } from "../tokenizer/token";
import type { TokenType } from "../tokenizer/token-type";
import type { BaseTreeNode } from "./base-tree-node";

export interface Atom<T extends TokenType = TokenType> extends BaseTreeNode {
    type: "atom"
    token: Token<T>
}
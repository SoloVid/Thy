import type { Token } from "../tokenizer/token";
import type { tLet } from "../tokenizer/token-type";
import type { BaseTreeNode } from "./base-tree-node";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";

export interface LetCall extends BaseTreeNode, TokenRange {
    type: "let-call"
    letToken: Token<typeof tLet>
    call: Call
}

import type { Token } from "../tokenizer/token";

export interface TokenRange {
    readonly firstToken: Token
    readonly lastToken: Token
}
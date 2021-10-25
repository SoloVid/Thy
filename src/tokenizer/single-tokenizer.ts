import type { TokenType } from "./token-type";

export interface SingleTokenizer {
    readonly type: TokenType | null
    match: SingleMatcher
}

export type SingleMatcher = (state: TokenizerState) => string | null

export interface TokenizerState {
    readonly text: string
    readonly offset: number
    readonly lastTokenType: TokenType | null
    readonly currentIndentWidth: number
}
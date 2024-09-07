import type { CompileError } from "../compile-error"
import type { TokenType } from "./token-type"
import type { Tokenizer } from "./tokenizer"
import type { TokenizerState } from "./tokenizer-state"

export const skipToken = Symbol("skipToken")

export type TokenFinderSingleResult = {
    readonly type: TokenType | typeof skipToken
    readonly text: string
}

export type TokenFinderMultiResult = TokenFinderSingleResult & {
    readonly tokenizer: Tokenizer
}

export type TokenFinderResult = TokenFinderSingleResult | TokenFinderMultiResult | null

export type TokenFinder = (state: TokenizerState, errors: CompileError[]) => TokenFinderResult

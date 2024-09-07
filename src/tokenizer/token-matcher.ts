import type { CompileError } from "../compile-error"
import type { TokenType } from "./token-type"
import type { Tokenizer } from "./tokenizer"
import type { TokenizerState } from "./tokenizer-state"

export const skipToken = Symbol("skipToken")

export type TokenMatcherSingleResult = {
    readonly type: TokenType | typeof skipToken
    readonly text: string
}

export type TokenMatcherMultiResult = TokenMatcherSingleResult & {
    readonly tokenizer: Tokenizer
}

export type TokenMatcherResult = TokenMatcherSingleResult | TokenMatcherMultiResult | null

export type TokenMatcher = (state: TokenizerState, errors: CompileError[]) => TokenMatcherResult

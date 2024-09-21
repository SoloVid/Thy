import type { CompileError } from "../common/compile-error"
import type { tErrorToken, TokenType } from "./token-type"
import type { Tokenizer } from "./tokenizer"
import type { TokenizerState } from "./tokenizer-state"

export const skipToken = Symbol("skipToken")

export type TokenMatcherResultNotNull = {
  readonly type: Exclude<TokenType, typeof tErrorToken> | typeof skipToken
  readonly text: string
  readonly tokenizer?: Tokenizer
}

export type TokenMatcherError = {
  readonly type: typeof skipToken | typeof tErrorToken
  readonly text: string
  readonly error: string
}

export type TokenMatcherResult =
  | TokenMatcherResultNotNull
  | TokenMatcherError
  | null

export type TokenMatcher = (
  state: TokenizerState,
  errors: CompileError[],
) => TokenMatcherResult

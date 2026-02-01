import type { CompileError } from "../common/compile-error.ts"
import type { tErrorToken, TokenType } from "./token-type.ts"
import type { Tokenizer } from "./tokenizer.ts"
import type { TokenizerState } from "./tokenizer-state.ts"

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

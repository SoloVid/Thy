import type { LexState } from "../state.ts"

export type TokenMatcherResultNotNull<TokenKind extends string = string> = {
  readonly kind: TokenKind
  readonly length: number
}

export type TokenMatcherResult<TokenKind extends string = string> = TokenMatcherResultNotNull<TokenKind> | null

export type TokenMatcher<TokenKind extends string = string> = (
  state: Readonly<LexState>,
) => TokenMatcherResult<TokenKind>

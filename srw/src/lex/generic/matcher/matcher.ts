import { TokenKind } from "../../token-kind.ts"
import type { LexState } from "../state.ts"

export type TokenMatcherResultNotNull = {
  readonly kind: TokenKind
  readonly length: number
}

export type TokenMatcherResult = TokenMatcherResultNotNull | null

export type TokenMatcher = (
  state: LexState,
) => TokenMatcherResult

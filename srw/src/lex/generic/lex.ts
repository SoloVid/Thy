import { munchTokensWithGaps } from "./gap-handler.ts"
import type { Muncher } from "./munch/muncher.ts"
import type { LexResult } from "./result.ts"
import type { LexState } from "./state.ts"
import type { Token } from "./token.ts"

export function lex<TokenKind extends string>(
  text: string,
  muncher: Muncher<TokenKind>,
): LexResult<TokenKind> {
  const state: LexState = {
    text: text,
    offset: 0,
  }
  return collectTokens(muncher, state)
}

function collectTokens<TokenKind extends string>(
  muncher: Muncher<TokenKind>,
  state: LexState,
): LexResult<TokenKind> {
  return munchTokensWithGaps(state, () => {
    const tokens: Token<TokenKind>[] = []
    let nextToken = muncher(state)
    while (nextToken) {
      tokens.push(nextToken)
      nextToken = muncher(state)
    }
    return tokens
  })
}

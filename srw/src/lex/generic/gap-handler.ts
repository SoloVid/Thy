import type { LexState } from "./state.ts"
import type { Token } from "./token.ts"

export function munchTokensWithGaps<TokenKind extends string>(
  state: LexState,
  munchTokensNoGap: () => Token<TokenKind>[],
): Token<TokenKind | null>[] {
  const tokens: Token<TokenKind | null>[] = []
  const tokenGapHandler = makeTokenGapHandler(state)
  while (state.offset < state.text.length) {
    const nextTokens = munchTokensNoGap()
    if (nextTokens.length > 0) {
      tokenGapHandler.appendPrecedingGapToken(tokens)
    }
    tokens.push(...nextTokens)

    // If we haven't finished consuming the text, we have hit a token gap.
    if (state.offset < state.text.length) {
      tokenGapHandler.updateTracking()
      state.offset += 1
    }
  }
  tokenGapHandler.appendFinalGapToken(tokens)
  return tokens
}

function makeTokenGapHandler<TokenKind extends string>(
  state: LexState,
) {
  /** The in-process gap token we're building. */
  let gapToken: Token<null> | null = null
  return {
    appendPrecedingGapToken(tokens: Token<TokenKind | null>[]) {
      if (gapToken) {
        tokens.push(gapToken)
        gapToken = null
      }
    },
    updateTracking() {
      if (!gapToken) {
        gapToken = {
          kind: null,
          offset: state.offset,
          length: 0,
        }
      }
      gapToken.length += 1
    },
    appendFinalGapToken(tokens: Token<TokenKind | null>[]) {
      if (gapToken) {
        tokens.push(gapToken)
      }
    },
  }
}

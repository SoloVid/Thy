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
  const tokens: Token<TokenKind | null>[] = []
  munchTokensWithErrors(muncher, state, tokens)
  return { tokens }
}

function munchTokensWithErrors<TokenKind extends string>(
  muncher: Muncher<TokenKind>,
  state: LexState,
  tokens: Token<TokenKind | null>[],
): void {
  const errorTokenHandler = makeErrorTokenHandler(state, tokens)
  while (state.offset < state.text.length) {
    const nextTokens = munchValidTokens(muncher, state)
    if (nextTokens.length > 0) {
      errorTokenHandler.appendPrecedingError()
    }
    tokens.push(...nextTokens)

    // If we haven't finished consuming the text, we have hit an error.
    if (state.offset < state.text.length) {
      errorTokenHandler.updateTracking()
      state.offset += 1
    }
  }
  errorTokenHandler.appendFinalError()
}

function munchValidTokens<TokenKind extends string>(
  muncher: Muncher<TokenKind>,
  state: LexState,
) {
  const tokens: Token<TokenKind>[] = []
  let nextToken = muncher(state)
  while (nextToken) {
    tokens.push(nextToken)
    nextToken = muncher(state)
  }
  return tokens
}

function makeErrorTokenHandler<TokenKind extends string>(
  state: LexState,
  tokens: Token<TokenKind | null>[],
) {
  /** The in-process error token we're building. */
  let errorToken: Token<null> | null = null
  return {
    appendPrecedingError() {
      if (errorToken) {
        tokens.push(errorToken)
        errorToken = null
      }
    },
    updateTracking() {
      if (!errorToken) {
        errorToken = {
          kind: null,
          offset: state.offset,
          length: 0,
        }
      }
      errorToken.length += 1
    },
    appendFinalError() {
      if (errorToken) {
        tokens.push(errorToken)
      }
    },
  }
}

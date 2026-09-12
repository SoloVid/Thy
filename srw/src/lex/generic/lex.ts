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
  const tokenProcessor = makeTokenProcessor(state, tokens)

  while (state.offset < state.text.length) {
    const nextToken = muncher(state)
    tokenProcessor.processNextToken(nextToken)
  }

  tokenProcessor.finalize()

  return tokens
}

function makeTokenProcessor<TokenKind extends string>(
  state: LexState,
  tokens: Pick<Token<TokenKind | null>[], "push">,
) {
  const tokenGapHandler = makeTokenGapHandler(state)

  return {
    processNextToken(nextToken: Token<TokenKind> | null) {
      if (nextToken) {
        tokenGapHandler.appendPrecedingGapToken(tokens)
        tokens.push(nextToken)
      } else if (state.offset < state.text.length) {
        tokenGapHandler.updateTracking()
        state.offset += 1
      }
    },
    finalize() {
      tokenGapHandler.appendFinalGapToken(tokens)
    },
  }
}

function makeTokenGapHandler<TokenKind extends string>(
  state: LexState,
) {
  /** The in-process gap token we're building. */
  let gapToken: Token<null> | null = null
  return {
    appendPrecedingGapToken(tokens: Pick<Token<TokenKind | null>[], "push">) {
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
    appendFinalGapToken(tokens: Pick<Token<TokenKind | null>[], "push">) {
      if (gapToken) {
        tokens.push(gapToken)
      }
    },
  }
}

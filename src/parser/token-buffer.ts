import { tEndStream } from "tokenizer/token-type"
import assert from "utils/assert"
import type { Token } from "../tokenizer/token"
import type { Tokenizer } from "../tokenizer/tokenizer"

export interface TokenBuffer {
  hasNextToken(): boolean
  peekToken(howManyAhead?: number): Token
  consumeToken(): Token
  getPreviousToken(): Token
}

export function makeTokenBuffer(tokenizer: Tokenizer): TokenBuffer {
  const upNext: Token[] = []
  let previousToken: Token | null = null

  function ensureUpcomingTokenCache(howMany: number) {
    while (upNext.length < howMany) {
      upNext.push(tokenizer.getNextToken())
    }
  }

  return {
    hasNextToken() {
      ensureUpcomingTokenCache(1)
      return upNext.length > 0
    },
    peekToken(howManyAhead: number = 0) {
      ensureUpcomingTokenCache(howManyAhead + 1)
      // assert(upNext.length >= howManyAhead + 1, endOfStreamErrorMessage)
      return upNext[howManyAhead]
    },
    consumeToken() {
      ensureUpcomingTokenCache(1)
      const t = upNext.shift()
      assert(!!t, "upNext cache should always have a token here")
      // assert(t != null, endOfStreamErrorMessage)
      assert(t.type !== tEndStream, endOfStreamErrorMessage)
      previousToken = t
      return t
    },
    getPreviousToken() {
      assert(
        previousToken !== null,
        "Called getPreviousToken() before any tokens consumed.",
      )
      return previousToken
    },
  }
}

const endOfStreamErrorMessage =
  "Unexpected end of token stream. This is a bug in the tokenizer/parser."

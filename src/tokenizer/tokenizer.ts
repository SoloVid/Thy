import { CompileError, tokenError } from "../compile-error"
import { debug } from "./debug"
import { skipToken, TokenMatcher } from "./token-matcher"
import type { Token } from "./token"
import { makeTokenHere, startTokenHere } from "./token-helper"
import { tErrorToken } from "./token-type"
import type { TokenizerState } from "./tokenizer-state"

export const endOfStream = Symbol("endOfStream")

export interface Tokenizer {
  /** Returns null at end of stream. */
  getNextToken(): Token | null
}

export type TokenizerFactory = (
  source: string,
  errors: CompileError[],
) => Tokenizer

export function makeGenericTokenizer(
  finders: readonly TokenMatcher[],
  state: TokenizerState,
  errors: CompileError[],
  isDone: () => boolean,
): Tokenizer {
  const itsAnError = Symbol("itsAnError")

  let nextToken: Token | null = null
  let delegatedTokenizer: Tokenizer | null = null

  function getNextValidToken(): Token | typeof endOfStream {
    debug(() => ["getNextValidToken()", state.offset])
    let errorCharacters = 0
    const errorPartialToken = startTokenHere(state, tErrorToken)
    while (nextToken === null && !isDone()) {
      const t = trySources()
      if (t === itsAnError) {
        errorCharacters++
        state.advance(tErrorToken, 1)
      } else {
        nextToken = t
      }
    }

    if (errorCharacters > 0) {
      const substringStart = state.offset - errorCharacters
      const t = {
        ...errorPartialToken,
        text: state.text.substring(
          substringStart,
          substringStart + errorCharacters,
        ),
      }
      errors.push(tokenError(t, "Unexpected token"))
      return t
    }

    if (nextToken !== null) {
      const t = nextToken
      nextToken = null
      return t
    }

    return endOfStream
  }

  function trySources(): Token | null | typeof itsAnError {
    debug(() => ["trySources()"])
    if (delegatedTokenizer) {
      debug(() => ["delegating..."])
      const token = delegatedTokenizer.getNextToken()
      if (token !== null) {
        return token
      } else {
        delegatedTokenizer = null
      }
    }
    debug(() => [
      "finding at ",
      JSON.stringify(state.text.substring(state.offset, state.offset + 5)),
    ])
    for (const finder of finders) {
      const match = finder(state, errors)
      if (match !== null) {
        debug(() => ["token found ", match])
        if ("tokenizer" in match) {
          delegatedTokenizer = match.tokenizer
        }
        if (match.type === skipToken) {
          state.advance(null, match.text.length)
          return null
        }
        return makeTokenHere(state, match.type, match.text)
      }
    }
    return itsAnError
  }

  return {
    getNextToken() {
      if (isDone()) {
        return null
      }
      const token = getNextValidToken()
      if (token === endOfStream) {
        return null
      }
      return token
    },
  }
}

import { CompileError, tokenError } from "../compile-error"
import { debug, debugDefer } from "./debug"
import type { Token } from "./token"
import { makeTokenHere } from "./token-helper"
import { skipToken, TokenMatcher } from "./token-matcher"
import { tEndStream, tErrorToken } from "./token-type"
import { debugState, type TokenizerState } from "./tokenizer-state"

export interface Tokenizer {
  getNextToken(): Token
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
  const cannotFindToken = Symbol("cannotFindToken")

  let nextToken: Token | null = null
  let delegatedTokenizer: Tokenizer | null = null

  function getNextValidToken(): Token {
    let errorCharacters = 0
    let errorPartialToken: Omit<Token, "text"> | null = null
    while (nextToken === null && (!isDone() || delegatedTokenizer)) {
      const t = trySources()
      if (t === cannotFindToken) {
        if (errorCharacters === 0) {
          errorPartialToken = {
            type: tErrorToken,
            offset: state.offset,
            line: state.line,
            column: state.column,
          }
        }
        errorCharacters++
        state.advance(tErrorToken, 1)
      } else {
        nextToken = t
      }
    }

    if (errorPartialToken !== null) {
      const t = {
        ...errorPartialToken,
        text: state.text.substring(
          errorPartialToken.offset,
          errorPartialToken.offset + errorCharacters,
        ),
      } as Token
      debug("error:", t)
      errors.push(tokenError(t, "Unexpected token"))
      return t
    }

    if (nextToken !== null) {
      const t = nextToken
      nextToken = null
      return t
    }

    return makeTokenHere(state, tEndStream, "")
  }

  function trySources(): Token | null | typeof cannotFindToken {
    if (delegatedTokenizer) {
      debug("delegating to nested tokenizer...")
      const token = delegatedTokenizer.getNextToken()
      if (token.type !== tEndStream) {
        return token
      } else {
        delegatedTokenizer = null
      }
    }
    if (isDone()) {
      return null
    }
    debugState(state)
    for (const finder of finders) {
      const match = finder(state, errors)
      if (match !== null) {
        debug("token found:", match)
        if ("error" in match) {
          debug("error:", match)
          errors.push(
            tokenError(
              {
                type: tErrorToken,
                offset: state.offset,
                line: state.line,
                column: state.column,
                text: match.text,
              },
              match.error,
            ),
          )
        }
        if ("tokenizer" in match && match.tokenizer) {
          delegatedTokenizer = match.tokenizer
        }
        if (match.type === skipToken) {
          state.advance(null, match.text.length)
          return null
        }
        return makeTokenHere(state, match.type, match.text)
      }
    }
    return cannotFindToken
  }

  return {
    getNextToken() {
      return getNextValidToken()
    },
  }
}

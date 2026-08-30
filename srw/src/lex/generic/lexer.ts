import { assertTODO } from "@/utils/assert-todo.ts"
import { Token } from "../token.ts"
import { findMatch } from "./find-match.ts"
import { TokenMatcher } from "./matcher/matcher.ts"
import { LexState } from "./state.ts"

export interface Lexer {
  getNextToken(): Token | null
}

export function makeGenericLexer(
  text: string,
  matchers: readonly TokenMatcher[],
): Lexer {
  const state: LexState = {
    text: text,
    offset: 0,
  }

  return {
    getNextToken: () => {
      const match = findMatch(state, matchers)
      if (!match) {
        return null
      }
      assertTODO(match, "Need to handle the case where none of the matchers match")
      const token: Token = {
        kind: match.kind,
        offset: state.offset,
        length: match.length,
      }
      state.offset += match.length
      return token
    }
  }
}

import { assertTODO } from "@/utils/assert-todo.ts"
import { Token } from "../token.ts"
import { Lexer } from "./lexer.ts"
import { TokenMatcher, TokenMatcherResult } from "./matcher/matcher.ts"
import { LexState } from "./state.ts"

export type Muncher = (
  state: LexState,
) => Token | null

export function makeMuncher(
  matcher: TokenMatcher,
): Muncher {
  return (state) => {
    const match = matcher(state)
    if (!match) {
      return null
    }
    assertTODO(
      match,
      "Need to handle the case where none of the matchers match",
    )
    const token: Token = {
      kind: match.kind,
      offset: state.offset,
      length: match.length,
    }
    state.offset += match.length
    return token
  }
}

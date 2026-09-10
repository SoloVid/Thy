import { assertTODO } from "@/utils/assert-todo.ts"
import { Token } from "../token.ts"
import { TokenMatcher, TokenMatcherResultNotNull } from "../match/matcher.ts"
import { LexState } from "../state.ts"

export type Muncher<TokenKind extends string = never> = (
  state: LexState,
) => Token<TokenKind> | null

export function makeMuncher<TokenKind extends string = string>(
  matcher: TokenMatcher<TokenKind>,
): Muncher<TokenKind> {
  return (state) => {
    const match = matcher(state)
    if (!match) {
      return null
    }
    assertTODO(
      match,
      "Need to handle the case where none of the matchers match but there is still input left",
    )
    return munchToken(state, match)
  }
}

function munchToken<TokenKind extends string = never>(
  state: LexState,
  match: TokenMatcherResultNotNull<TokenKind>,
) {
  const token: Token<TokenKind> = {
    kind: match.kind,
    offset: state.offset,
    length: match.length,
  }
  state.offset += match.length
  return token
}

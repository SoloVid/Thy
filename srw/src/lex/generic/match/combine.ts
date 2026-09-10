import { TokenMatcher } from "./matcher.ts"

export function combineMatchers<TokenKind extends string = string>(
  matchers: readonly TokenMatcher<TokenKind>[],
): TokenMatcher<TokenKind> {
  return (state) => {
    for (const matcher of matchers) {
      const match = matcher(state)
      if (match) {
        return match
      }
    }
    return null
  }
}

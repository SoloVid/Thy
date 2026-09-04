import { TokenMatcher } from "./matcher.ts"

export function combineMatchers(
  matchers: readonly TokenMatcher[],
): TokenMatcher {
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

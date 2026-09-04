import { LexState } from "./state.ts"
import { TokenMatcher } from "./matcher/matcher.ts"

export function findMatch(
  state: Readonly<LexState>,
  matchers: readonly TokenMatcher[],
) {
  for (const matcher of matchers) {
    const match = matcher(state)
    if (match) {
      return match
    }
  }
  return null
}

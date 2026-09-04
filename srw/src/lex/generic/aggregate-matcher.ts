import { assertTODO } from "@/utils/assert-todo.ts"
import { findMatch } from "./find-match.ts"
import { TokenMatcher } from "./matcher/matcher.ts"

export function makeAggregateMatcher(
  matchers: readonly TokenMatcher[],
): TokenMatcher {
  return (state) => {
    const match = findMatch(state, matchers)
    if (!match) {
      return null
    }
    assertTODO(
      match,
      "Need to handle the case where none of the matchers match",
    )
    return {
      kind: match.kind,
      length: match.length,
    }
  }
}

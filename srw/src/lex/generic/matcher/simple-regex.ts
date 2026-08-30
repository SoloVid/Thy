import { TokenKind } from "../../token-kind.ts"
import { TokenMatcher } from "./matcher.ts"

export function makeSimpleRegexMatcher<Kind extends TokenKind>(
  kind: Kind,
  regex: RegExp,
): TokenMatcher {
  const statefulRegex = new RegExp(regex, "my")
  return (state) => {
    statefulRegex.lastIndex = state.offset
    const result = statefulRegex.exec(state.text)
    if (result === null) {
      return null
    }
    return {
      kind,
      length: result[0].length,
    }
  }
}

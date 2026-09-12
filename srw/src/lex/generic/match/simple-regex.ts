import { TokenMatcher } from "./matcher.ts"

export function makeSimpleRegexMatcher<TokenKind extends string = string>(
  kind: TokenKind,
  regex: RegExp,
): TokenMatcher<TokenKind> {
  const statefulRegex = new RegExp(regex, "y")
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

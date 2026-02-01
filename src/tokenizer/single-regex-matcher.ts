import { debug } from "./debug.ts"
import type { skipToken, TokenMatcher } from "./token-matcher.ts"
import type { tErrorToken, TokenType } from "./token-type.ts"

export function makeSingleRegexMatcher(
  type: Exclude<TokenType, typeof tErrorToken> | typeof skipToken,
  regex: RegExp,
): TokenMatcher {
  const statefulRegex = new RegExp(regex, "my")
  return (state) => {
    statefulRegex.lastIndex = state.offset
    debug("matching:", statefulRegex)
    const result = statefulRegex.exec(state.text)
    if (result === null) {
      return null
    }
    return {
      type,
      text: result[0],
    }
  }
}

import { debug } from "./debug"
import type { skipToken, TokenMatcher } from "./token-matcher"
import type { TokenType } from "./token-type"

export function makeSingleRegexMatcher(
  type: TokenType | typeof skipToken,
  regex: RegExp,
): TokenMatcher {
  const statefulRegex = new RegExp(regex, "my")
  return (state) => {
    statefulRegex.lastIndex = state.offset
    debug(() => ["matching:", statefulRegex])
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

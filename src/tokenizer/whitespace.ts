import { makeSingleRegexMatcher } from "./single-regex-matcher.ts"
import { skipToken } from "./token-matcher.ts"
import { tStatementTerminator } from "./token-type.ts"

export const matchStatementTerminator = makeSingleRegexMatcher(
  tStatementTerminator,
  /\r?\n/,
)
export const matchWhitespace = makeSingleRegexMatcher(skipToken, / +/)

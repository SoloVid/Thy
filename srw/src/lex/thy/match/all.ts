import { keywordMatchers } from "./keywords.ts"
import { numberMatcher } from "./number.ts"
import { statementTerminatorMatcher, whitespaceMatcher } from "./whitespace.ts"

export const allMatchers = [
  whitespaceMatcher,
  statementTerminatorMatcher,
  ...keywordMatchers,
  numberMatcher,
] as const

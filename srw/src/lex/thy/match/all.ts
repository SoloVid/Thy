import { keywordMatchers } from "./keywords.ts"
import { numberMatcher } from "./number.ts"
import { whitespaceMatcher } from "./whitespace.ts"

export const allMatchers = [
  whitespaceMatcher,
  ...keywordMatchers,
  numberMatcher,
] as const

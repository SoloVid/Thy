import { makeSimpleRegexMatcher as m } from "../generic/match/simple-regex.ts"
import { tReturn } from "../token-kind.ts"

export const keywordMatchers = [
  m(tReturn, /\breturn\b/),
]

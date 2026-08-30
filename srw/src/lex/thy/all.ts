import { keywordMatchers } from "./keywords.ts"
import { makeSimpleRegexMatcher as m } from "../generic/matcher/simple-regex.ts"
import { tNumber } from "@/lex/token-kind.ts"

export const allMatchers = [
  ...keywordMatchers,
  m(tNumber, /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/),
] as const

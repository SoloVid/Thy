import { makeSingleRegexMatcher } from "./single-regex-matcher.ts"
import { tNumberLiteral } from "./token-type.ts"

export const matchNumber = makeSingleRegexMatcher(
  tNumberLiteral,
  /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
)

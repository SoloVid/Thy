import { makeSingleRegexMatcher } from "./single-regex-matcher"
import { tNumberLiteral } from "./token-type"

export const matchNumber = makeSingleRegexMatcher(
  tNumberLiteral,
  /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
)

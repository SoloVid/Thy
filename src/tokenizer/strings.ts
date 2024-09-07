import { matchValueIdentifier } from "./identifier"
import { makeNestedTokenizerMatcher } from "./nested-tokenizer"
import { makeSingleRegexMatcher } from "./single-regex-matcher"
import {
  tEndString,
  tEndStringInterpolation,
  tStartString,
  tStartStringInterpolation,
  tStringText,
} from "./token-type"

const matchStringInterpolationEnd = makeSingleRegexMatcher(
  tEndStringInterpolation,
  /\./,
)
export const matchStringInterpolation = makeNestedTokenizerMatcher(
  tStartStringInterpolation,
  /\.(?=[a-z][a-zA-Z0-9]*\.)/,
  [matchValueIdentifier, matchStringInterpolationEnd],
  (state) => state.lastTokenType === tEndStringInterpolation,
)

const matchStringText = makeSingleRegexMatcher(tStringText, /(?:\\.|[^".])+/)
const matchSimpleStringLiteralEnd = makeSingleRegexMatcher(tEndString, /"/)
export const matchSimpleStringLiteral = makeNestedTokenizerMatcher(
  tStartString,
  /"(?!"")/,
  [matchStringText, matchSimpleStringLiteralEnd, matchStringInterpolation],
  (state) => state.lastTokenType === tEndString,
)

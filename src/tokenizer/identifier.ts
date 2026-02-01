import { makeSingleRegexMatcher } from "./single-regex-matcher.ts"
import {
  tMemberAccessOperator,
  tTypeIdentifier,
  tValueIdentifier,
} from "./token-type.ts"

export const matchTypeIdentifier = makeSingleRegexMatcher(
  tTypeIdentifier,
  /([A-Z][a-zA-Z0-9]*)/,
)
export const matchValueIdentifier = makeSingleRegexMatcher(
  tValueIdentifier,
  /([a-z][a-zA-Z0-9]*)/,
)
export const matchMemberAccessOperator = makeSingleRegexMatcher(
  tMemberAccessOperator,
  /(?<=[a-zA-Z0-9])\.(?=[a-zA-Z])/,
)

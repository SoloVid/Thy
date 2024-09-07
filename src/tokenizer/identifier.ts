import { makeSingleRegexMatcher } from "./single-regex-matcher"
import {
  tMemberAccessOperator,
  tTypeIdentifier,
  tValueIdentifier,
} from "./token-type"

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

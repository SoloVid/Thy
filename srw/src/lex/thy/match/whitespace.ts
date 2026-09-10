import { tWhitespace } from "../token-kind.ts"
import { makeSimpleRegexMatcher as m } from "../../generic/match/simple-regex.ts"

export const whitespaceMatcher = m(tWhitespace, / +/)

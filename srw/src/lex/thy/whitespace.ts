import { tWhitespace } from "@/lex/token-kind.ts"
import { makeSimpleRegexMatcher as m } from "../generic/matcher/simple-regex.ts"

export const whitespaceMatcher = m(tWhitespace, / +/)

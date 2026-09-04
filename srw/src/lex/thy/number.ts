import { tNumber } from "@/lex/token-kind.ts"
import { makeSimpleRegexMatcher as m } from "../generic/matcher/simple-regex.ts"

export const numberMatcher = m(tNumber, /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/)

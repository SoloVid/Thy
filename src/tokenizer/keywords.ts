import { makeSingleRegexMatcher } from "./single-regex-matcher"
import {
  tAwait,
  tConstDeclAssign,
  tExport,
  tGiven,
  tLet,
  tNoDeclAssign,
  tPrivate,
  tReturn,
  tStatementContinuation,
  tThat,
  tThy,
  tType,
  tTypeGiven,
  tVarDeclAssign,
} from "./token-type"

export const matchStatementContinuation = makeSingleRegexMatcher(
  tStatementContinuation,
  /\r?\n *and\b/,
)

export const matchConstDeclAssign = makeSingleRegexMatcher(
  tConstDeclAssign,
  /\bis\b/,
)
export const matchVarDeclAssign = makeSingleRegexMatcher(
  tVarDeclAssign,
  /\bbe\b/,
)
export const matchNoDeclAssign = makeSingleRegexMatcher(tNoDeclAssign, /\bto\b/)
export const matchExport = makeSingleRegexMatcher(tExport, /\bexport\b/)
export const matchPrivate = makeSingleRegexMatcher(tPrivate, /\bprivate\b/)
export const matchType = makeSingleRegexMatcher(tType, /\btype\b/)
export const matchLet = makeSingleRegexMatcher(tLet, /\blet\b/)

export const matchAwait = makeSingleRegexMatcher(tAwait, /\bawait\b/)
export const matchGiven = makeSingleRegexMatcher(tGiven, /\bgiven\b/)
export const matchReturn = makeSingleRegexMatcher(tReturn, /\breturn\b/)
export const matchThy = makeSingleRegexMatcher(tThy, /\bthy\b/)
export const matchThat = makeSingleRegexMatcher(tThat, /\bthat\b/)
export const matchTypeGiven = makeSingleRegexMatcher(tTypeGiven, /\bGiven\b/)

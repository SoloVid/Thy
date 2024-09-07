import { makeSingleRegexTokenizer } from "./single-regex-tokenizer"
import { tAwait, tConstDeclAssign, tExport, tGiven, tLet, tNoDeclAssign, tPrivate, tReturn, tStatementContinuation, tThat, tType, tVarDeclAssign } from "./token-type"

export const statementContinuationTokenizer = makeSingleRegexTokenizer(tStatementContinuation, /\r?\n *and\b/)

export const isTokenizer = makeSingleRegexTokenizer(tConstDeclAssign, /\bis\b/)
export const beTokenizer = makeSingleRegexTokenizer(tVarDeclAssign, /\bbe\b/)
export const toTokenizer = makeSingleRegexTokenizer(tNoDeclAssign, /\bto\b/)
export const exportTokenizer = makeSingleRegexTokenizer(tExport, /\bexport\b/)
export const privateTokenizer = makeSingleRegexTokenizer(tPrivate, /\bprivate\b/)
export const typeTokenizer = makeSingleRegexTokenizer(tType, /\btype\b/)
export const letTokenizer = makeSingleRegexTokenizer(tLet, /\blet\b/)

export const awaitTokenizer = makeSingleRegexTokenizer(tAwait, /\bawait\b/)
export const givenTokenizer = makeSingleRegexTokenizer(tGiven, /\bgiven\b/)
export const returnTokenizer = makeSingleRegexTokenizer(tReturn, /\breturn\b/)
export const thatTokenizer = makeSingleRegexTokenizer(tThat, /\bthat\b/)

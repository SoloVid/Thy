import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tStatementContinuation, tVarDeclAssign, tExport, tConstDeclAssign, tPrivate, tNoDeclAssign, tType, tLet } from "./token-type";

export const statementContinuationTokenizer = makeSingleRegexTokenizer(tStatementContinuation, /\r?\n *and\b/)
export const isTokenizer = makeSingleRegexTokenizer(tConstDeclAssign, /\bis\b/)
export const beTokenizer = makeSingleRegexTokenizer(tVarDeclAssign, /\bbe\b/)
export const toTokenizer = makeSingleRegexTokenizer(tNoDeclAssign, /\bto\b/)
export const exportTokenizer = makeSingleRegexTokenizer(tExport, /\bexport\b/)
export const privateTokenizer = makeSingleRegexTokenizer(tPrivate, /\bprivate\b/)
export const typeTokenizer = makeSingleRegexTokenizer(tType, /\btype\b/)
export const letTokenizer = makeSingleRegexTokenizer(tLet, /\blet\b/)

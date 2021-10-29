import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tStatementContinuation, tVarDeclAssign, tExport, tConstDeclAssign, tPrivate, tNoDeclAssign, tType, tYield } from "./token-type";

export const andTokenizer = makeSingleRegexTokenizer(tStatementContinuation, /\r?\n *and\b/)
export const isTokenizer = makeSingleRegexTokenizer(tConstDeclAssign, /\bis\b/)
export const beTokenizer = makeSingleRegexTokenizer(tVarDeclAssign, /\bbe\b/)
export const toTokenizer = makeSingleRegexTokenizer(tNoDeclAssign, /\bto\b/)
export const exportTokenizer = makeSingleRegexTokenizer(tExport, /\bexport\b/)
export const privateTokenizer = makeSingleRegexTokenizer(tPrivate, /\bprivate\b/)
export const typeTokenizer = makeSingleRegexTokenizer(tType, /\btype\b/)
export const yieldTokenizer = makeSingleRegexTokenizer(tYield, /\byield\b/)

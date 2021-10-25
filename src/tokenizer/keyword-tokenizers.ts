import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tBe, tExport, tIs, tPrivate, tTo, tType, tYield } from "./token-type";

export const isTokenizer = makeSingleRegexTokenizer(tIs, /\bis\b/)
export const beTokenizer = makeSingleRegexTokenizer(tBe, /\bbe\b/)
export const toTokenizer = makeSingleRegexTokenizer(tTo, /\bto\b/)
export const exportTokenizer = makeSingleRegexTokenizer(tExport, /\bexport\b/)
export const privateTokenizer = makeSingleRegexTokenizer(tPrivate, /\bprivate\b/)
export const typeTokenizer = makeSingleRegexTokenizer(tType, /\btype\b/)
export const yieldTokenizer = makeSingleRegexTokenizer(tYield, /\byield\b/)

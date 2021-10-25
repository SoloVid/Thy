import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tNumberLiteral } from "./token-type";

export const numberTokenizer = makeSingleRegexTokenizer(tNumberLiteral, /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/)
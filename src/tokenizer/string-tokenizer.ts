import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tStringLiteral } from "./token-type";

export const stringLiteralTokenizer = makeSingleRegexTokenizer(tStringLiteral, /"(\\.|[^"])*"/)
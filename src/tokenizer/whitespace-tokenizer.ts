import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tStatementSeparator } from "./token-type";

export const statementSeparatorTokenizer = makeSingleRegexTokenizer(tStatementSeparator, /\n|\r\n?/)
export const whitespaceTokenizer = makeSingleRegexTokenizer(null, / +/)

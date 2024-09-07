import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { skipToken } from "./single-tokenizer";
import { tStatementTerminator } from "./token-type";

export const statementTerminatorTokenizer = makeSingleRegexTokenizer(tStatementTerminator, /\r?\n/)
export const whitespaceTokenizer = makeSingleRegexTokenizer(skipToken, / +/)

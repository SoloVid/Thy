import { makeSingleRegexMatcher } from "./single-regex-matcher";
import { skipToken } from "./token-matcher";
import { tStatementTerminator } from "./token-type";

export const matchStatementTerminator = makeSingleRegexMatcher(tStatementTerminator, /\r?\n/)
export const matchWhitespace = makeSingleRegexMatcher(skipToken, / +/)

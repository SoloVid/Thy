import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tMemberAccessOperator, tTypeIdentifier, tValueIdentifier } from "./token-type";

export const typeIdentifierTokenizer = makeSingleRegexTokenizer(tTypeIdentifier, /([A-Z][a-zA-Z0-9]*)/)
export const valueIdentifierTokenizer = makeSingleRegexTokenizer(tValueIdentifier, /([a-z][a-zA-Z0-9]*)/)
export const memberAccessOperatorTokenizer = makeSingleRegexTokenizer(tMemberAccessOperator, /(?<=[a-zA-Z0-9])\.(?=[a-zA-Z])/)

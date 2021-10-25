import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import { tScopedTypeIdentifier, tScopedValueIdentifier, tUnscopedTypeIdentifier, tUnscopedValueIdentifier } from "./token-type";

export const scopedTypeIdentifierTokenizer = makeSingleRegexTokenizer(tScopedTypeIdentifier, /([a-z][a-zA-Z0-9]*\.)+([A-Z][a-zA-Z0-9]*)/)
export const scopedValueIdentifierTokenizer = makeSingleRegexTokenizer(tScopedValueIdentifier, /([a-z][a-zA-Z0-9]*\.)+([a-z][a-zA-Z0-9]*)/)
export const unscopedTypeIdentifierTokenizer = makeSingleRegexTokenizer(tUnscopedTypeIdentifier, /([A-Z][a-zA-Z0-9]*)/)
export const unscopedValueIdentifierTokenizer = makeSingleRegexTokenizer(tUnscopedValueIdentifier, /([a-z][a-zA-Z0-9]*)/)

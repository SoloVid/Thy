import type { SingleTokenizer, TokenizerState } from "./single-tokenizer"
import type { TokenType } from "./token-type"

export function makeSingleRegexTokenizer(type: TokenType | null, regex: RegExp): SingleTokenizer {
    const statefulRegex = new RegExp(regex, 'y')
    return {
        type,
        match(state: TokenizerState) {
            statefulRegex.lastIndex = state.offset
            const result = statefulRegex.exec(state.text)
            if (result === null) {
                return null
            }
            return result[0]
        }
    }
}

import { debug } from "./debug"
import type { skipToken, TokenFinder } from "./single-tokenizer"
import type { TokenType } from "./token-type"

export function makeSingleRegexTokenizer(type: TokenType | typeof skipToken, regex: RegExp): TokenFinder {
    const statefulRegex = new RegExp(regex, 'y')
    return (state) => {
        statefulRegex.lastIndex = state.offset
        debug(() => ["Looking for ", statefulRegex])
        const result = statefulRegex.exec(state.text)
        if (result === null) {
            return null
        }
        return {
            type,
            text: result[0],
        }
    }
}

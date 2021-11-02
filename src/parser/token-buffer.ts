import assert from "assert";
import type { Token } from "../tokenizer/token";
import type { Tokenizer } from "../tokenizer/tokenizer";

export interface TokenBuffer {
    peekToken(howManyAhead?: number): Token
    consumeToken(): Token
    getPreviousToken(): Token
}

export function makeTokenBuffer(tokenizer: Tokenizer): TokenBuffer {
    const upNext: Token[] = []
    let previousToken: Token | null = null

    return {
        peekToken(howManyAhead: number = 0) {
            while (upNext.length <= howManyAhead) {
                const t = tokenizer.getNextToken()
                assert(t !== null, endOfStreamErrorMessage)
                upNext.push(t)
            }
            return upNext[howManyAhead]
        },
        consumeToken() {
            const t = upNext.length >= 1 ? upNext.shift() : tokenizer.getNextToken()
            assert(t != null, endOfStreamErrorMessage)
            previousToken = t
            return t
        },
        getPreviousToken() {
            assert(previousToken !== null, 'Called getPreviousToken() before any tokens consumed.')
            return previousToken
        }
    }
}

const endOfStreamErrorMessage = 'Unexpected end of token stream. This is a bug in the tokenizer/parser.'

import assert from "assert";
import { Token } from "../tokenizer/token";
import { Tokenizer } from "../tokenizer/tokenizer";

export interface TokenBuffer {
    peekToken(howManyAhead?: number): Token | null
    consumeToken(): Token
    getPreviousToken(): Token
}

export function makeTokenBuffer(tokenizer: Tokenizer): TokenBuffer {
    const upNext: Token[] = []
    let previousToken: Token | null = null

    let atEnd = false

    return {
        peekToken(howManyAhead: number = 0) {
            if (atEnd) {
                return null
            }

            while (upNext.length <= howManyAhead) {
                const t = tokenizer.getNextToken()
                if (t === null) {
                    atEnd = true
                    return null
                }
                upNext.push(t)
            }
            return upNext[howManyAhead]
        },
        consumeToken() {
            // TODO: Is this how to handle end consumeToken()?
            assert(!atEnd)

            const t = upNext.length >= 1 ? upNext.shift() : tokenizer.getNextToken()
            // TODO: Is this how to handle end?
            assert(t != null)
            previousToken = t
            return t
        },
        getPreviousToken() {
            // TODO: Is this how I want to handle null previousToken?
            assert(previousToken !== null)
            return previousToken
        }
    }
}

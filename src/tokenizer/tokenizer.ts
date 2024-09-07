import { CompileError, tokenError } from "../compile-error";
import { matchComment, matchMultilineComment } from "./comment-tokenizer";
import { debug } from "./debug";
import { memberAccessOperatorTokenizer, typeIdentifierTokenizer, valueIdentifierTokenizer } from "./identifier-tokenizer";
import { makeIndentTokenizers } from "./indent-tokenizer";
import { awaitTokenizer, beTokenizer, exportTokenizer, givenTokenizer, isTokenizer, letTokenizer, privateTokenizer, returnTokenizer, statementContinuationTokenizer, thatTokenizer, toTokenizer, typeTokenizer } from "./keyword-tokenizers";
import { numberTokenizer } from "./number-tokenizer";
import { skipToken, TokenFinder } from "./single-tokenizer";
import { simpleStringLiteralTokenizer } from "./string-tokenizer";
import type { Token } from "./token";
import { tEndBlock, tErrorToken, TokenType, tStartBlock } from "./token-type";
import { makeTokenizerState, TokenizerState } from "./tokenizer-state";
import { statementTerminatorTokenizer, whitespaceTokenizer } from "./whitespace-tokenizer";

export const endOfStream = Symbol('endOfStream')

export interface Tokenizer {
    /** Returns null at end of stream. */
    getNextToken(): Token | null
}

export type TokenizerFactory = (source: string, errors: CompileError[]) => Tokenizer

function startTokenHere(state: TokenizerState, type: TokenType): Omit<Token, "text"> {
    return {
        type: type,
        offset: state.offset,
        line: state.line,
        column: state.column,
    }
}

function makeTokenHere(state: TokenizerState, type: TokenType, text: string) {
    const partial = startTokenHere(state, type)
    state.advance(type, text.length)
    return {
        ...partial,
        text
    }
}

export function makeBlockTokenizer(source: string, errors: CompileError[]): Tokenizer {
    const indentation = makeIndentTokenizers()

    const state = makeTokenizerState(source)

    const finders: readonly TokenFinder[] = [
        // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
        // Outdent must appear before Indent for handling zero spaces outdents.
        indentation.outdent,
        indentation.indent,
        statementContinuationTokenizer,
        statementTerminatorTokenizer,
        matchMultilineComment,
        matchComment,
        whitespaceTokenizer,

        // Keywords
        isTokenizer,
        beTokenizer,
        toTokenizer,
        exportTokenizer,
        privateTokenizer,
        typeTokenizer,
        letTokenizer,

        // Semi-keywords
        awaitTokenizer,
        givenTokenizer,
        returnTokenizer,
        thatTokenizer,

        // Variable expressions
        numberTokenizer,
        memberAccessOperatorTokenizer,
        typeIdentifierTokenizer,
        valueIdentifierTokenizer,
        simpleStringLiteralTokenizer,
    ]

    const innerTokenizer = makeTokenizer(finders, state, errors, () => !state.hasMoreText())

    let startTokenGiven = false
    let closingEndBlocks: null | number = null

    return {
        getNextToken() {
            if (!startTokenGiven) {
                startTokenGiven = true
                return makeTokenHere(state, tStartBlock, "")
            }
            let token = innerTokenizer.getNextToken()
            if (token === null) {
                if (closingEndBlocks === null) {
                    closingEndBlocks = indentation.currentIndentLevels + 1
                }
                if (closingEndBlocks > 0) {
                    closingEndBlocks--
                    return makeTokenHere(state, tEndBlock, "")
                }
                return null
            }
            return token
        },
    }
}

export function makeTokenizer(finders: readonly TokenFinder[], state: TokenizerState, errors: CompileError[], isDone: () => boolean): Tokenizer {
    const itsAnError = Symbol('itsAnError')

    let nextToken: Token | null = null
    let delegatedTokenizer: Tokenizer | null = null

    function getNextValidToken(): Token | typeof endOfStream {
        debug(() => ["getNextValidToken()", state.offset])
        let errorCharacters = 0
        const errorPartialToken = startTokenHere(state, tErrorToken)
        while (nextToken === null && !isDone()) {
            const t = trySources()
            if (t === itsAnError) {
                errorCharacters++
                state.advance(tErrorToken, 1)
            } else {
                nextToken = t
            }
        }

        if (errorCharacters > 0) {
            const substringStart = state.offset - errorCharacters
            const t = {
                ...errorPartialToken,
                text: state.text.substring(substringStart, substringStart + errorCharacters)
            }
            errors.push(tokenError(t, 'Unexpected token'))
            return t
        }

        if (nextToken !== null) {
            const t = nextToken
            nextToken = null
            return t
        }

        return endOfStream
    }

    function trySources(): Token | null | typeof itsAnError {
        debug(() => ["trySources()"])
        if (delegatedTokenizer) {
            debug(() => ["delegating..."])
            const token = delegatedTokenizer.getNextToken()
            if (token !== null) {
                return token
            } else {
                delegatedTokenizer = null
            }
        }
        debug(() => ["finding at ", JSON.stringify(state.text.substring(state.offset, state.offset + 5))])
        for (const finder of finders) {
            const match = finder(state, errors)
            if (match !== null) {
                debug(() => ["token found ", match])
                if ("tokenizer" in match) {
                    delegatedTokenizer = match.tokenizer
                }
                if (match.type === skipToken) {
                    state.advance(null, match.text.length)
                    return null
                }
                return makeTokenHere(state, match.type, match.text)
            }
        }
        return itsAnError
    }

    return {
        getNextToken() {
            if (isDone()) {
                return null
            }
            const token = getNextValidToken()
            if (token === endOfStream) {
                return null
            }
            return token
        },
    }
}


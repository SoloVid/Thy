import { CompileError, tokenError } from "../compile-error";
import { commentTokenizer, multilineCommentTokenizer } from "./comment-tokenizer";
import { memberAccessOperatorTokenizer, typeIdentifierTokenizer, valueIdentifierTokenizer } from "./identifier-tokenizer";
import { makeIndentTokenizers } from "./indent-tokenizer";
import { andTokenizer, beTokenizer, exportTokenizer, isTokenizer, privateTokenizer, toTokenizer, typeTokenizer, yieldTokenizer } from "./keyword-tokenizers";
import { numberTokenizer } from "./number-tokenizer";
import type { SingleTokenizer } from "./single-tokenizer";
import { stringLiteralTokenizer } from "./string-tokenizer";
import type { SourcePosition, Token } from "./token";
import { tEndBlock, tErrorToken, TokenType, tStartBlock } from "./token-type";
import { statementTerminatorTokenizer, whitespaceTokenizer } from "./whitespace-tokenizer";

export const endOfStream = Symbol('endOfStream')

export interface Tokenizer {
    /** Returns null at end of stream. */
    getNextToken(): Token | null

    getCurrentPosition(): SourcePosition
}

export type TokenizerFactory = (source: string, errors: CompileError[]) => Tokenizer

export function makeTokenizer(source: string, errors: CompileError[]): Tokenizer {
    const indentation = makeIndentTokenizers()

    const tokenizers: readonly SingleTokenizer[] = [

        // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
        // Outdent must appear before Indent for handling zero spaces outdents.
        indentation.outdent,
        indentation.indent,
        andTokenizer,
        statementTerminatorTokenizer,
        multilineCommentTokenizer,
        commentTokenizer,
        whitespaceTokenizer,

        // Keywords
        isTokenizer,
        beTokenizer,
        toTokenizer,
        exportTokenizer,
        privateTokenizer,
        typeTokenizer,
        yieldTokenizer,

        // Variable expressions
        numberTokenizer,
        memberAccessOperatorTokenizer,
        typeIdentifierTokenizer,
        valueIdentifierTokenizer,
        stringLiteralTokenizer,
    ]

    const state = {
        text: source,
        offset: 0,
        lastTokenType: null as TokenType | null,
        get currentIndentWidth() {
            return indentation.currentIndentWidth
        }
    }

    const lineOffsets = [0]

    function startTokenHere(type: TokenType): Omit<Token, "text"> {
        const currentOffset = state.offset
        const currentLine = lineOffsets.length - 1
        const currentColumn = currentOffset - lineOffsets[currentLine]
        return {
            type: type,
            offset: currentOffset,
            line: currentLine,
            column: currentColumn
        }
    }

    function makeTokenHere(type: TokenType, text: string) {
        state.lastTokenType = type
        const partial = startTokenHere(type)
        return {
            ...partial,
            text
        }
    }

    const noToken = Symbol('noToken')
    const itsAnError = Symbol('itsAnError')

    let nextToken: Token | null = null

    function getNextValidToken(): Token | typeof endOfStream {
        let errorCharacters = 0
        const errorPartialToken = startTokenHere(tErrorToken)
        while (nextToken === null && state.offset < source.length) {
            const t = tryTokenizers()
            if (t === itsAnError) {
                errorCharacters++
                state.offset++
            } else if (t !== noToken) {
                nextToken = t
            }
        }

        if (errorCharacters > 0) {
            const t = {
                ...errorPartialToken,
                text: state.text.substr(state.offset - errorCharacters, errorCharacters)
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

    function tryTokenizers(): Token | typeof noToken | typeof itsAnError {
        for (const tokenizer of tokenizers) {
            const match = tokenizer.match(state)
            if (match !== null) {
                const token = tokenizer.type === null ? noToken : makeTokenHere(tokenizer.type, match)

                for (let i = 0; i < match.length; i++) {
                    const c = match.charAt(i)
                    if (c === "\n") {
                        lineOffsets.push(state.offset + i + 1)
                    }
                }

                state.offset += match.length

                return token
            }
        }
        return itsAnError
    }

    let startTokenGiven = false
    let closingEndBlocks: null | number = null

    return {
        getNextToken() {
            if (!startTokenGiven) {
                startTokenGiven = true
                return makeTokenHere(tStartBlock, "")
            }
            let token = getNextValidToken()
            if (token === endOfStream) {
                if (closingEndBlocks === null) {
                    closingEndBlocks = indentation.currentIndentLevels + 1
                }
                if (closingEndBlocks > 0) {
                    closingEndBlocks--;
                    return makeTokenHere(tEndBlock, "")
                }
                return null
            }
            return token
        },
        getCurrentPosition() {
            return startTokenHere('not a token')
        }
    }
}


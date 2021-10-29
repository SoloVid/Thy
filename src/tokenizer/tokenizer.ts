import { commentTokenizer, multilineCommentTokenizer } from "./comment-tokenizer";
import { scopedTypeIdentifierTokenizer, scopedValueIdentifierTokenizer, unscopedTypeIdentifierTokenizer, unscopedValueIdentifierTokenizer } from "./identifier-tokenizer";
import { makeIndentTokenizers } from "./indent-tokenizer";
import { andTokenizer, beTokenizer, exportTokenizer, isTokenizer, privateTokenizer, toTokenizer, typeTokenizer, yieldTokenizer } from "./keyword-tokenizers";
import { numberTokenizer } from "./number-tokenizer";
import type { SingleTokenizer } from "./single-tokenizer";
import { stringLiteralTokenizer } from "./string-tokenizer";
import type { Token } from "./token";
import { tEndBlock, TokenType, tStartBlock } from "./token-type";
import { statementTerminatorTokenizer, whitespaceTokenizer } from "./whitespace-tokenizer";


export interface Tokenizer {
    /** Returns null at end of stream. */
    getNextToken(): Token | null
}

export function makeTokenizer(source: string): Tokenizer {
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
        scopedTypeIdentifierTokenizer,
        scopedValueIdentifierTokenizer,
        unscopedTypeIdentifierTokenizer,
        unscopedValueIdentifierTokenizer,
        stringLiteralTokenizer,
    ]

    const state = {
        text: source,
        offset: 0,
        lastTokenType: null,
        get currentIndentWidth() {
            return indentation.currentIndentWidth
        }
    }

    const lineOffsets = [0]

    function makeTokenHere(type: TokenType, text: string) {
        const currentOffset = state.offset
        const currentLine = lineOffsets.length - 1
        const currentColumn = currentOffset - lineOffsets[currentLine]
        return {
            type: type,
            text: text,
            offset: currentOffset,
            line: currentLine,
            column: currentColumn
        }
    }

    function tryTokenizers() {
        for (const tokenizer of tokenizers) {
            const match = tokenizer.match(state)
            if (match !== null) {
                const token = tokenizer.type === null ? null : makeTokenHere(tokenizer.type, match)

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
        throw new Error(`Unable to match token at ${state.offset}`)
    }

    let startTokenGiven = false
    let closingEndBlocks: null | number = null

    return {
        getNextToken() {
            if (!startTokenGiven) {
                startTokenGiven = true
                return makeTokenHere(tStartBlock, "")
            }
            let token = null
            while (token === null) {
                if (state.offset >= source.length) {
                    if (closingEndBlocks === null) {
                        closingEndBlocks = indentation.currentIndentLevels + 1
                    }
                    if (closingEndBlocks > 0) {
                        closingEndBlocks--;
                        return makeTokenHere(tEndBlock, "")
                    }
                    return null
                }
                token = tryTokenizers()
            }
            return token
        }
    }
}


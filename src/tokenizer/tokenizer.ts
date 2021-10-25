import { commentTokenizer, multilineCommentTokenizer } from "./comment-tokenizer";
import { scopedTypeIdentifierTokenizer, scopedValueIdentifierTokenizer, unscopedTypeIdentifierTokenizer, unscopedValueIdentifierTokenizer } from "./identifier-tokenizer";
import { makeIndentTokenizers } from "./indent-tokenizer";
import { beTokenizer, exportTokenizer, isTokenizer, privateTokenizer, toTokenizer, typeTokenizer, yieldTokenizer } from "./keyword-tokenizers";
import { numberTokenizer } from "./number-tokenizer";
import type { SingleTokenizer } from "./single-tokenizer";
import { stringLiteralTokenizer } from "./string-tokenizer";
import type { Token } from "./token";
import { statementSeparatorTokenizer, whitespaceTokenizer } from "./whitespace-tokenizer";


interface Tokenizer {
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
        statementSeparatorTokenizer,
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

    function tryTokenizers() {
        for (const tokenizer of tokenizers) {
            const match = tokenizer.match(state)
            if (match !== null) {
                const currentOffset = state.offset
                state.offset += match.length

                if (tokenizer.type === null) {
                    return null
                }

                return {
                    type: tokenizer.type,
                    text: match,
                    offset: currentOffset
                }
            }
        }
        throw new Error(`Unable to match token at ${state.offset}`)
    }

    return {
        getNextToken() {
            let token = null
            while (token === null) {
                if (state.offset >= source.length) {
                    return null
                }
                token = tryTokenizers()
            }
            return token
        }
    }
}


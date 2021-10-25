import type { SingleMatcher, SingleTokenizer, TokenizerState } from "./single-tokenizer";
import { tEndBlock, tStartBlock } from "./token-type";

export interface IndentTokenizers {
    indent: SingleTokenizer
    outdent: SingleTokenizer
    readonly currentIndentLevels: number
    readonly currentIndentWidth: number
}

export function makeIndentTokenizers(): IndentTokenizers {
    // State required for matching the indentations
    const indentStack = [0]
    const regex = /(?:\n|(?:\r\n?))( *(?=[^\r\n]))(and(?=[ \r\n]))?/y

    function matchIndent(state: TokenizerState) {
        regex.lastIndex = state.offset
        const match = regex.exec(state.text)
        if (match === null) {
            return null
        }

        const currIndentLevel = match[1].length
        const prevIndentLevel = indentStack[indentStack.length - 1]

        // Indentation is not deeper; so it isn't an indent.
        if (currIndentLevel <= prevIndentLevel) {
            return null
        }

        indentStack.push(currIndentLevel)
        return match[0]
    }

    let lastOutdentOffset = -1
    let outdentsOutstanding = 0

    function matchOutdent(state: TokenizerState) {
        if (outdentsOutstanding > 0) {
            indentStack.pop()
            outdentsOutstanding--
            return ""
        }

        // We're often not consuming anything but just generating tokens.
        // In that case, we don't want to infinitely generate tokens.
        if (lastOutdentOffset >= state.offset) {
            return null
        }
        lastOutdentOffset = state.offset

        regex.lastIndex = state.offset
        const match = regex.exec(state.text)
        if (match === null) {
            return null
        }

        const currIndentLevel = match[1].length
        const prevIndentLevel = indentStack[indentStack.length - 1]

        // Indentation is not shallower, so it isn't an outdent.
        if (currIndentLevel >= prevIndentLevel) {
            return null
        }

        const matchIndentIndex = indentStack.lastIndexOf(currIndentLevel)

        // Any outdent must match some previous indentation level.
        if (matchIndentIndex === -1) {
            throw Error(`invalid outdent at offset: ${state.offset}`)
        }

        const numOutdents = indentStack.length - matchIndentIndex - 1

        // Since we can only return one token, queue up "matches" for the next round.
        outdentsOutstanding = numOutdents - 1

        indentStack.pop()
        if (match[2] === "and") {
            // Consume all the text through "and". We don't want a statement separator to be generated.
            return match[0]
        } else {
            // Generate an outdent token, but don't consume any text. We want a statement separator to be generated.
            return ""
        }
    }

    return {
        indent: {
            type: tStartBlock,
            match: matchIndent
        },
        outdent: {
            type: tEndBlock,
            match: matchOutdent
        },
        get currentIndentLevels() {
            return indentStack.length - 1
        },
        get currentIndentWidth() {
            return indentStack[indentStack.length - 1]
        }
    }
}
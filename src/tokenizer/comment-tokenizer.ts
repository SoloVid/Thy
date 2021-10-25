import { TokenizerState } from "./single-tokenizer"
import { tComment, tMultilineComment, tStartBlock, tStatementSeparator } from "./token-type"

export const multilineCommentTokenizer = {
    type: tMultilineComment,
    match: matchMultilineComment
}
export const commentTokenizer = {
    type: tComment,
    match: matchComment
}

function isStartOfLine(state: TokenizerState): boolean {
    return state.lastTokenType === null || state.lastTokenType === tStatementSeparator || state.lastTokenType === tStartBlock
}

export function matchMultilineComment(state: TokenizerState): string | null {
    if (!isStartOfLine(state)) {
        return null
    }

    const regex = /[A-Z]{3,}(?=[\r\n])/y
    regex.lastIndex = state.offset
    const openResult = regex.exec(state.text)
    if (openResult === null) {
        return null
    }

    const tag = openResult[0]
    const indentWidth = state.currentIndentWidth
    const fullCommentRegex = new RegExp(`${tag}(.|\\r|\\n)*?\\n {${indentWidth}}${tag}(?=[\\r\\n])`, 'my')
    fullCommentRegex.lastIndex = state.offset
    const result = fullCommentRegex.exec(state.text)
    if (result === null) {
        return null
    }

    return result[0]
}

export function matchComment(state: TokenizerState): string | null {
    if (!isStartOfLine(state)) {
        return null
    }
    const regex = /[A-Z][^\r\n]*/y
    regex.lastIndex = state.offset
    const result = regex.exec(state.text)
    if (result === null) {
        return null
    }
    return result[0]
}

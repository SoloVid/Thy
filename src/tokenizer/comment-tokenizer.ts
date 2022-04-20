import { TokenizerState } from "./single-tokenizer"
import { tComment, tEndBlock, tStartBlock, tStatementTerminator } from "./token-type"

export const multilineCommentTokenizer = {
    type: tComment,
    match: matchMultilineComment
}
export const commentTokenizer = {
    type: tComment,
    match: matchComment
}

function isStartOfLine(state: TokenizerState): boolean {
    return [null, tStatementTerminator, tStartBlock, tEndBlock].includes(state.lastTokenType)
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
    const fullCommentRegex = new RegExp(`(${tag}.*\\r?\\n)(((^ {${indentWidth}}.*)|(^ *))\\r?\\n)* {${indentWidth}}${tag}(?=[\\r\\n])`, 'my')
    fullCommentRegex.lastIndex = state.offset
    const result = fullCommentRegex.exec(state.text)
    if (result === null) {
        // TODO: May want to consume the rest of the input here and emit error about unclosed multiline comment.
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

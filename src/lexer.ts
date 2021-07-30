import { createToken, createTokenInstance, Lexer, CstParser, IToken } from "chevrotain"
import * as _ from "lodash";

// Reserved words

// Continues argument list on next line
// export const And = createToken({ name: "And", pattern: /and/ })

// Variable declaration with deferred assignment (a la ES `let`)
export const Be = createToken({ name: "Be", pattern: /be/ })

// Kind of like mixture of ES `export` and `public`
// Why different from function call? It requires identifier name.
export const Export = createToken({ name: "Export", pattern: /export\b/ })

// Assignment (implicit `const` declaration)
export const Is = createToken({ name: "Is", pattern: /is\b/ })

export const Private = createToken({name: "Private", pattern: /private\b/ })

// Assignment (for `let` variables)
export const To = createToken({ name: "To", pattern: /to\b/ })

// Like TypeScript type
export const Type = createToken({ name: "Type", pattern: /type\b/ })

// Shorthand for `defer await`; actually just what defer would have been.
export const Yield = createToken({ name: "Yield", pattern: /yield\b/ })

export const StringLiteral = createToken({
    name: "StringLiteral",
    pattern: /\.([^\.]|\.\.|\.[a-zA-Z])*\./
})
export const NumberLiteral = createToken({
    name: "NumberLiteral",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
})

export const ScopedTypeIdentifier = createToken({ name: "ScopedTypeIdentifier", pattern: /([a-z][a-zA-Z0-9]*\.)*([A-Z][a-zA-Z0-9]*)/ })
export const ScopedValueIdentifier = createToken({ name: "ScopedValueIdentifier", pattern: /([a-z][a-zA-Z0-9]*\.)*([a-z][a-zA-Z0-9]*)/ })

// newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
// and thus we can check before creating an indentation token that the last token matched was a newline.
export const StatementSeparator = createToken({
    name: "StatementSeparator",
    pattern: /\n|\r\n?/,
    // group: "nl"
})

function isStartOfLine(matchedTokens: IToken[]): boolean {
    const lastTokenType = matchedTokens[matchedTokens.length - 1]?.tokenType
    return lastTokenType === undefined || lastTokenType === StatementSeparator || lastTokenType === Indent

}

function matchMultilineComment(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }) {
    if (isStartOfLine(matchedTokens)) {
        const regex = /[A-Z]{3,}(?=[\r\n])/y
        regex.lastIndex = offset
        const openResult = regex.exec(text)
        if (openResult !== null) {
            const tag = openResult[0]
            const indentLevel = indentStack[indentStack.length - 1]
            const fullCommentRegex = new RegExp(`${tag}(.|\\r|\\n)*?\\n {${indentLevel}}${tag}(?=[\\r\\n])`, 'my')
            fullCommentRegex.lastIndex = offset
            return fullCommentRegex.exec(text)
        }
    }
    return null
}

function matchComment(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }) {
    if (isStartOfLine(matchedTokens)) {
        const regex = /[A-Z][^\r\n]*/y
        regex.lastIndex = offset
        return regex.exec(text)
    }
    return null
}

// State required for matching the indentations
let indentStack = [0]

/**
* This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
* combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
* Taken from https://github.com/chevrotain/chevrotain/blob/master/examples/lexer/python_indentation/python_indentation.js
*
* @param {string} text - the full text to lex, sent by the Chevrotain lexer.
* @param {number} offset - the offset to start matching in the text.
* @param {IToken[]} matchedTokens - Tokens lexed so far, sent by the Chevrotain Lexer.
* @param {object} groups - Token groups already lexed, sent by the Chevrotain Lexer.
* @param {string} type - determines if this function matches Indent or Outdent tokens.
* @returns {*}
*/
function matchIndentBase(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }, type: string) {
    const regex = /(?:\n|(?:\r\n?))( *(?=[^\r\n]))(and(?=[ \r\n]))?/y
    regex.lastIndex = offset
    const match = regex.exec(text)
    if (match === null) {
        return null
    }
    const currIndentLevel = match[1].length
    const prevIndentLevel = indentStack[indentStack.length - 1]
    // deeper indentation
    if (currIndentLevel > prevIndentLevel && type === "indent") {
        indentStack.push(currIndentLevel)
        return match
    }
    // shallower indentation
    else if (currIndentLevel < prevIndentLevel && type === "outdent") {
        const matchIndentIndex = indentStack.lastIndexOf(currIndentLevel)

        // any outdent must match some previous indentation level.
        if (matchIndentIndex === -1) {
            throw Error(`invalid outdent at offset: ${offset}`)
        }

        const numberOfDedents = indentStack.length - matchIndentIndex - 1

        for (let i = 0; i < numberOfDedents - 1; i++) {
            indentStack.pop()
            matchedTokens.push(
                createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN)
            )
        }
        indentStack.pop()
        if (match[2] === "and") {
            // Let Chevrotain generate the last outdent token.
            return match
        } else {
            // Generate the last outdent token here and let Chevrotain generate a newline token.
            matchedTokens.push(
                createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN)
            )
            return null
        }
    }
    return null
}

// customize matchIndentBase to create separate functions of Indent and Outdent.
const matchIndent = _.partialRight(matchIndentBase, "indent")
const matchOutdent = _.partialRight(matchIndentBase, "outdent")

// define the indentation tokens using custom token patterns
export const Indent = createToken({
    name: "Indent",
    pattern: matchIndent,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: true
})
export const Outdent = createToken({
    name: "Outdent",
    pattern: matchOutdent,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: true
})

export const MultilineComment = createToken({
    name: "MultilineComment",
    pattern: matchMultilineComment,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: true
})

export const Comment = createToken({
    name: "Comment",
    pattern: matchComment,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false
})

export const Spaces = createToken({
    name: "Spaces",
    pattern: / +/,
    group: Lexer.SKIPPED
})

export const allTokens = [
    // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
    // Outdent must appear before Indent for handling zero spaces outdents.
    Outdent,
    Indent,
    StatementSeparator,
    MultilineComment,
    Comment,
    Spaces,

    // Keywords
    // And,
    Be,
    Export,
    Private,
    Is,
    To,
    Type,
    Yield,

    // Variable expressions
    NumberLiteral,
    ScopedTypeIdentifier,
    ScopedValueIdentifier,
    StringLiteral,
]

export const lexer = new Lexer(allTokens)
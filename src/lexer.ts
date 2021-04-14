import { createToken, createTokenInstance, Lexer, CstParser, IToken } from "chevrotain"
import * as _ from 'lodash'

// Reserved words
const At = createToken({ name: "At", pattern: /at/ })
const And = createToken({ name: "And", pattern: /and/ })
const Class = createToken({ name: "Class", pattern: /class/ })
const ElseIf = createToken({ name: "ElseIf", pattern: /elseif/ })
const Else = createToken({ name: "Else", pattern: /else/ })
const False = createToken({ name: "False", pattern: /false/ })
const For = createToken({ name: "For", pattern: /for/ })
const Fun = createToken({ name: "Fun", pattern: /fun/ })
const Given = createToken({ name: "Given", pattern: /given/ })
const Gte = createToken({ name: "Gte", pattern: /gte/ })
const Gt = createToken({ name: "Gt", pattern: /gt/ })
const If = createToken({ name: "If", pattern: /if/ })
const Is = createToken({ name: "Is", pattern: /is/ })
const Lte = createToken({ name: "Lte", pattern: /lte/ })
const Lt = createToken({ name: "Lt", pattern: /lt/ })
const Not = createToken({ name: "Not", pattern: /not/ })
const Null = createToken({ name: "Null", pattern: /null/ })
const Or = createToken({ name: "Or", pattern: /or/ })
const Return = createToken({ name: "Return", pattern: /return/ })
const True = createToken({ name: "True", pattern: /true/ })
const While = createToken({ name: "While", pattern: /while/ })

const StringLiteral = createToken({
    name: "StringLiteral",
    pattern: /\.([^\.]|\.\.)*\./
})
const NumberLiteral = createToken({
    name: "NumberLiteral",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
})

const IdentifierExpression = createToken({ name: "IdentifierExpression", pattern: /[a-zA-Z]+(\.([a-zA-Z]+))*/ })

// newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
// and thus we can check before creating an indentation token that the last token matched was a newline.
const Newline = createToken({
    name: "Newline",
    pattern: /\n|\r\n?/,
    // group: "nl"
})

function isStartOfLine(matchedTokens: IToken[]): boolean {
    const lastTokenType = _.last(matchedTokens)?.tokenType
    return lastTokenType === Newline || lastTokenType === Indent || lastTokenType === Outdent

}

function matchMultilineComment(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }) {
    if (isStartOfLine(matchedTokens)) {
        const regex = /[A-Z]{3,}(?=[\r\n])/y
        regex.lastIndex = offset
        const openResult = regex.exec(text)
        if (openResult !== null) {
            // console.log('Maybe multiline match')
            // console.log(openResult)
            const tag = openResult[0]
            // console.log(tag)
            const indentLevel = _.last(indentStack)!
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
let lastIndentAnalysisOffset = -1

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
    const noTokensMatchedYet = _.isEmpty(matchedTokens)
    const lastToken = _.last(matchedTokens)
    // indentation can only be matched at the start of a line.
    if (noTokensMatchedYet || lastToken?.tokenType === Newline) {
        const newlineOffset = lastToken?.endOffset ?? -1
        const compareOffset = lastIndentAnalysisOffset
        lastIndentAnalysisOffset = offset
        if (newlineOffset < compareOffset && offset !== compareOffset) {
            return null
        }
        let match
        let currIndentLevel: number | undefined = undefined

        const wsRegExp = / +/y
        wsRegExp.lastIndex = offset
        match = wsRegExp.exec(text)
        // possible non-empty indentation
        if (match !== null) {
            currIndentLevel = match[0].length
        }
        // "empty" indentation means indentLevel of 0.
        else {
            currIndentLevel = 0
        }

        const prevIndentLevel = _.last(indentStack)!
        // deeper indentation
        if (currIndentLevel > prevIndentLevel && type === "indent") {
            indentStack.push(currIndentLevel)
            return match
        }
        // shallower indentation
        else if (currIndentLevel < prevIndentLevel && type === "outdent") {
            const matchIndentIndex = _.findLastIndex(
                indentStack,
                (stackIndentDepth) => stackIndentDepth === currIndentLevel
            )

            // any outdent must match some previous indentation level.
            if (matchIndentIndex === -1) {
                throw Error(`invalid outdent at offset: ${offset}`)
            }

            const numberOfDedents = indentStack.length - matchIndentIndex - 1

            // This is a little tricky
            // 1. If there is no match (0 level indent) than this custom token
            //    matcher would return "null" and so we need to add all the required outdents ourselves.
            // 2. If there was match (> 0 level indent) than we need to add minus one number of outsents
            //    because the lexer would create one due to returning a none null result.
            let iStart = match !== null ? 1 : 0
            for (let i = iStart; i < numberOfDedents; i++) {
                indentStack.pop()
                matchedTokens.push(
                    createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN)
                )
            }

            // even though we are adding fewer outdents directly we still need to update the indent stack fully.
            if (iStart === 1) {
                indentStack.pop()
            }
            return match
        } else {
            // same indent, this should be lexed as simple whitespace and ignored
            return null
        }
    } else {
        // indentation cannot be matched under other circumstances
        return null
    }
}

// customize matchIndentBase to create separate functions of Indent and Outdent.
const matchIndent = _.partialRight(matchIndentBase, "indent")
const matchOutdent = _.partialRight(matchIndentBase, "outdent")

// define the indentation tokens using custom token patterns
const Indent = createToken({
    name: "Indent",
    pattern: matchIndent,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false
})
const Outdent = createToken({
    name: "Outdent",
    pattern: matchOutdent,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false
})

const MultilineComment = createToken({
    name: "MultilineComment",
    pattern: matchMultilineComment,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: true
})

const Comment = createToken({
    name: "Comment",
    pattern: matchComment,
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false
})

const Spaces = createToken({
    name: "Spaces",
    pattern: / +/,
    group: Lexer.SKIPPED
})

const allTokens = [
    Newline,
    // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
    // Outdent must appear before Indent for handling zero spaces outdents.
    Outdent,
    Indent,
    MultilineComment,
    Comment,
    Spaces,

    // Keywords
    At,
    And,
    Class,
    ElseIf,
    Else,
    False,
    For,
    Fun,
    Given,
    Gte,
    Gt,
    If,
    Is,
    Lte,
    Lt,
    Not,
    Null,
    Or,
    Return,
    True,
    While,

    // Variable expressions
    NumberLiteral,
    IdentifierExpression,
    StringLiteral,
]

export const lexer = new Lexer(allTokens)
import { createToken, createTokenInstance, Lexer, CstParser, IToken } from "chevrotain"
import * as _ from 'lodash'

const True = createToken({ name: "True", pattern: /true/ })
const False = createToken({ name: "False", pattern: /false/ })
const Null = createToken({ name: "Null", pattern: /null/ })
const If = createToken({ name: "If", pattern: /if/ })
const ElseIf = createToken({ name: "ElseIf", pattern: /elseif/ })
const Else = createToken({ name: "Else", pattern: /else/ })
const For = createToken({ name: "For", pattern: /for/ })
const While = createToken({ name: "While", pattern: /while/ })
const Is = createToken({ name: "Is", pattern: /is/ })
const Fun = createToken({ name: "Fun", pattern: /fun/ })
const Class = createToken({ name: "Class", pattern: /class/ })

const StringLiteral = createToken({
    name: "StringLiteral",
    pattern: /\.([^\.]|\.\.)*\./
})
const NumberLiteral = createToken({
    name: "NumberLiteral",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
})

const IdentifierExpression = createToken({ name: "Identifier", pattern: /[a-zA-Z]+(\.([a-zA-Z]+|[0-9]+))*/ })

// newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
// and thus we can check before creating an indentation token that the last token matched was a newline.
const Newline = createToken({
    name: "Newline",
    pattern: /\n|\r\n?/,
    // group: "nl"
})

function isStartOfLine(offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }) {
    // const noTokensMatchedYet = _.isEmpty(matchedTokens)
    // const newLines = groups.nl
    // const noNewLinesMatchedYet = _.isEmpty(newLines)
    // const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet
    // const isStartOfLine =
    //     // only newlines matched so far
    //     (noTokensMatchedYet && !noNewLinesMatchedYet) ||
    //     // Both newlines and other Tokens have been matched AND the offset is just after the last newline
    //     (!noTokensMatchedYet &&
    //         !noNewLinesMatchedYet &&
    //         // _.last(matchedTokens)?.tokenType === Newline)
    //         offset === _.last(newLines)!.startOffset + 1)
    // return isFirstLine || isStartOfLine

    const noTokensMatchedYet2 = _.isEmpty(matchedTokens)
    const lastTokenType = _.last(matchedTokens)?.tokenType
    // if (isFirstLine || isStartOfLine) {
    //     console.log(`${matchedTokens.length} matched tokens`)
    //     console.log('Should see Newline last, but seeing ' + lastTokenType?.name);
    // }
    return noTokensMatchedYet2 || lastTokenType === Newline
}

function matchComment(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }) {
    const lastTokenType = _.last(matchedTokens)?.tokenType
    // indentation can only be matched at the start of a line.
    if (isStartOfLine(offset, matchedTokens, groups) || lastTokenType == Indent || lastTokenType == Outdent) {
        const regex = / *[A-Z][^\r\n]*/y
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
            console.log(`false positive ${newlineOffset} vs ${compareOffset}`)
            return null
        } else {
            console.log(`Good to go ${newlineOffset} vs ${compareOffset}`)
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
        console.log(`Current indent level: ${currIndentLevel} vs ${prevIndentLevel}`)
        // deeper indentation
        if (currIndentLevel > prevIndentLevel && type === "indent") {
            console.log("indent")
            indentStack.push(currIndentLevel)
            return match
        }
        // shallower indentation
        else if (currIndentLevel < prevIndentLevel && type === "outdent") {
            console.log("outdent")
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
    Comment,
    Spaces,
    True,
    False,
    Null,
    If,
    ElseIf,
    Else,
    For,
    While,
    Is,
    Fun,
    Class,
    NumberLiteral,
    IdentifierExpression,
    StringLiteral,
]

export const lexer = new Lexer(allTokens)
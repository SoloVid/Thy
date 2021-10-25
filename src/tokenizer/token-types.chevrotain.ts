import { createToken, createTokenInstance, IToken, Lexer } from "chevrotain"

export class TokenTypes {

    // Reserved words.

    // Assignment (implicit `const` declaration).
    readonly Is = createToken({ name: "Is", pattern: /is\b/ })
    // Variable declaration with deferred assignment (a la ES `let`).
    readonly Be = createToken({ name: "Be", pattern: /be/ })
    // Assignment (for `let` variables).
    readonly To = createToken({ name: "To", pattern: /to\b/ })

    // Kind of like mixture of ES `export` and `public`.
    // Why different from function call? It requires identifier name.
    readonly Export = createToken({ name: "Export", pattern: /export\b/ })
    // Kind of like ES `private`.
    readonly Private = createToken({ name: "Private", pattern: /private\b/ })

    // Like TypeScript `type`.
    readonly Type = createToken({ name: "Type", pattern: /type\b/ })

    // Allow function to return for us.
    readonly Yield = createToken({ name: "Yield", pattern: /yield\b/ })

    readonly StringLiteral = createToken({
        name: "StringLiteral",
        pattern: /\.([^\.]|\.\.|\.[a-zA-Z])*\./
    })
    readonly NumberLiteral = createToken({
        name: "NumberLiteral",
        pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
    })

    readonly ScopedTypeIdentifier = createToken({
        name: "ScopedTypeIdentifier",
        pattern: /([a-z][a-zA-Z0-9]*\.)*([A-Z][a-zA-Z0-9]*)/
    })
    readonly ScopedValueIdentifier = createToken({
        name: "ScopedValueIdentifier",
        pattern: /([a-z][a-zA-Z0-9]*\.)*([a-z][a-zA-Z0-9]*)/
    })

    readonly StatementSeparator = createToken({
        name: "StatementSeparator",
        pattern: /\n|\r\n?/
    })

    // define the indentation tokens using custom token patterns
    readonly StartBlock = createToken({
        name: "StartBlock",
        pattern: (...args) => this.matchIndentBase(...args, "indent"),
        // custom token patterns should explicitly specify the line_breaks option
        line_breaks: true
    })
    readonly EndBlock = createToken({
        name: "EndBlock",
        pattern: (...args) => this.matchIndentBase(...args, "outdent"),
        // custom token patterns should explicitly specify the line_breaks option
        line_breaks: true
    })

    readonly MultilineComment = createToken({
        name: "MultilineComment",
        pattern: this.matchMultilineComment.bind(this),
        // custom token patterns should explicitly specify the line_breaks option
        line_breaks: true
    })

    readonly Comment = createToken({
        name: "Comment",
        pattern: this.matchComment.bind(this),
        // custom token patterns should explicitly specify the line_breaks option
        line_breaks: false
    })

    readonly Spaces = createToken({
        name: "Spaces",
        pattern: / +/,
        group: Lexer.SKIPPED
    })

    readonly allTokens = [
        // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
        // Outdent must appear before Indent for handling zero spaces outdents.
        this.EndBlock,
        this.StartBlock,
        this.StatementSeparator,
        this.MultilineComment,
        this.Comment,
        this.Spaces,

        // Keywords
        this.Is,
        this.Be,
        this.To,
        this.Export,
        this.Private,
        this.Type,
        this.Yield,

        // Variable expressions
        this.NumberLiteral,
        this.ScopedTypeIdentifier,
        this.ScopedValueIdentifier,
        this.StringLiteral,
    ]

    private isStartOfLine(matchedTokens: IToken[]): boolean {
        const lastTokenType = matchedTokens[matchedTokens.length - 1]?.tokenType
        return lastTokenType === undefined || lastTokenType === this.StatementSeparator || lastTokenType === this.StartBlock
    }

    private matchMultilineComment(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }) {
        if (this.isStartOfLine(matchedTokens)) {
            const regex = /[A-Z]{3,}(?=[\r\n])/y
            regex.lastIndex = offset
            const openResult = regex.exec(text)
            if (openResult !== null) {
                const tag = openResult[0]
                const indentLevel = this.indentStack[this.indentStack.length - 1]
                const fullCommentRegex = new RegExp(`${tag}(.|\\r|\\n)*?\\n {${indentLevel}}${tag}(?=[\\r\\n])`, 'my')
                fullCommentRegex.lastIndex = offset
                return fullCommentRegex.exec(text)
            }
        }
        return null
    }

    private matchComment(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }) {
        if (this.isStartOfLine(matchedTokens)) {
            const regex = /[A-Z][^\r\n]*/y
            regex.lastIndex = offset
            return regex.exec(text)
        }
        return null
    }

    // State required for matching the indentations
    private indentStack = [0]

    /**
    * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
    * combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
    * Modified from https://github.com/chevrotain/chevrotain/blob/master/examples/lexer/python_indentation/python_indentation.js
    *
    * @param text - the full text to lex, sent by the Chevrotain lexer.
    * @param offset - the offset to start matching in the text.
    * @param matchedTokens - Tokens lexed so far, sent by the Chevrotain Lexer.
    * @param groups - Token groups already lexed, sent by the Chevrotain Lexer.
    * @param type - determines if this function matches Indent or Outdent tokens.
    */
    private matchIndentBase(text: string, offset: number, matchedTokens: IToken[], groups: { [groupName: string]: IToken[] }, type: string) {
        const regex = /(?:\n|(?:\r\n?))( *(?=[^\r\n]))(and(?=[ \r\n]))?/y
        regex.lastIndex = offset
        const match = regex.exec(text)
        if (match === null) {
            return null
        }
        const currIndentLevel = match[1].length
        const prevIndentLevel = this.indentStack[this.indentStack.length - 1]
        // Deeper indentation.
        if (currIndentLevel > prevIndentLevel && type === "indent") {
            this.indentStack.push(currIndentLevel)
            return match
        }
        // Shallower indentation.
        else if (currIndentLevel < prevIndentLevel && type === "outdent") {
            const matchIndentIndex = this.indentStack.lastIndexOf(currIndentLevel)

            // Any outdent must match some previous indentation level.
            if (matchIndentIndex === -1) {
                throw Error(`invalid outdent at offset: ${offset}`)
            }

            const numOutdents = this.indentStack.length - matchIndentIndex - 1

            for (let i = 0; i < numOutdents - 1; i++) {
                this.indentStack.pop()
                matchedTokens.push(
                    createTokenInstance(this.EndBlock, "", NaN, NaN, NaN, NaN, NaN, NaN)
                )
            }
            this.indentStack.pop()
            if (match[2] === "and") {
                // Let Chevrotain generate the last outdent token.
                return match
            } else {
                // Generate the last outdent token here and let Chevrotain generate a newline token (instead of consuming the characters here).
                matchedTokens.push(
                    createTokenInstance(this.EndBlock, "", NaN, NaN, NaN, NaN, NaN, NaN)
                )
                return null
            }
        }
        return null
    }
}

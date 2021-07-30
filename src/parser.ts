import { createToken, createTokenInstance, Lexer, CstParser, IToken } from "chevrotain"
import { allTokens } from "./lexer"
import * as t from "./lexer"

export class MobyParser extends CstParser {
    constructor() {
        super(allTokens, {
            // maxLookahead: 20,
        })

        this.performSelfAnalysis()
    }

    script = this.RULE("script", () => {
        this.MANY_SEP({
            SEP: t.StatementSeparator,
            DEF: () => {
                this.SUBRULE(this.statement)
            }
        })
        // this.MANY(() => {
        //     this.OPTION(() => {
        //         this.SUBRULE(this.statement)
        //     })
        //     this.CONSUME1(t.StatementSeparator)
        // })
    })

    statement = this.RULE("statement", () => {
        this.OR([
            { ALT: () => this.CONSUME(t.MultilineComment) },
            { ALT: () => this.CONSUME(t.Comment) },
            // { ALT: () => this.SUBRULE(this.unparsedStatement) },
            { ALT: () => this.SUBRULE(this.typeStatement) },
            { ALT: () => this.SUBRULE(this.constantAssignment) },
            { ALT: () => this.SUBRULE(this.variableAssignment) },
            { ALT: () => this.SUBRULE(this.variableDeclaration) },
            { ALT: () => this.SUBRULE(this.functionCallStatement) },
            { ALT: () => { console.warn('something unexpected: ' + JSON.stringify(this.LA(1))) } },
        ])
    })

    // unparsedStatement = this.RULE("unparsedStatement", () => {
    //     this.MANY(() => {
    //         this.OR([
    //             { ALT: () => this.CONSUME(t.And) },
    //             { ALT: () => this.CONSUME(t.Be) },
    //             { ALT: () => this.CONSUME(t.Export) },
    //             { ALT: () => this.CONSUME(t.Is) },
    //             { ALT: () => this.CONSUME(t.To) },
    //             { ALT: () => this.CONSUME(t.Type) },
    //             { ALT: () => this.SUBRULE(this.block) },
    //             { ALT: () => this.CONSUME(t.NumberLiteral) },
    //             { ALT: () => this.CONSUME(t.ScopedTypeIdentifier) },
    //             { ALT: () => this.CONSUME(t.ScopedValueIdentifier) },
    //             { ALT: () => this.CONSUME(t.StringLiteral) },
    //         ])
    //     })
    // })

    functionCallStatement = this.RULE("functionCallStatement", () => {
        this.OPTION(() => {
            this.CONSUME(t.Yield)
        })
        this.SUBRULE(this.namedFunctionCall)
    })

    namedFunctionCall = this.RULE("namedFunctionCall", () => {
        this.CONSUME(t.ScopedValueIdentifier)
        this.SUBRULE(this.typeArguments)
        this.SUBRULE(this.argumentsRule)
    })

    functionCall = this.RULE("functionCall", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.namedFunctionCall) },
            { ALT: () => this.SUBRULE(this.argumentsStartingWithBlockRule) }
        ])
    })

    constantAssignment = this.RULE("constantAssignment", () => {
        this.exportOrPrivate()
        this.SUBRULE(this.unscopedValueIdentifier)
        this.CONSUME(t.Is)
        this.SUBRULE(this.functionCall)
    })

    variableAssignment = this.RULE("variableAssignment", () => {
        this.SUBRULE(this.unscopedValueIdentifier)
        this.CONSUME(t.To)
        this.SUBRULE(this.functionCall)
    })

    variableDeclaration = this.RULE("declaration", () => {
        this.exportOrPrivate()
        this.SUBRULE(this.unscopedValueIdentifier)
        this.CONSUME(t.Be)
        this.SUBRULE(this.parameterizedType)
    })

    argumentsRule = this.RULE("argumentsRule", () => {
        this.MANY(() => this.SUBRULE(this.atomicExpression))
        this.OPTION(() => this.SUBRULE(this.argumentsStartingWithBlockRule))
    })

    argumentsStartingWithBlockRule = this.RULE("argumentsStartingWithBlockRule", () => {
        this.SUBRULE(this.block)
        this.OPTION(() => {
            // this.CONSUME(t.And)
            this.SUBRULE(this.argumentsRule)
        })
    })

    atomicExpression = this.RULE("atomicExpression", () => {
        this.OR([
            { ALT: () => this.CONSUME(t.NumberLiteral) },
            { ALT: () => this.CONSUME(t.StringLiteral) },
            { ALT: () => this.CONSUME(t.ScopedValueIdentifier) },
        ])
    })

    // newlineIndent = this.RULE("newlineIndent", () => {
    //     this.CONSUME2(t.Newline)
    //     this.CONSUME(t.Indent)
    // })

    block = this.RULE("block", () => {
        this.CONSUME(t.Indent)
        // this.SUBRULE(this.newlineIndent)
        this.SUBRULE(this.script)
        this.CONSUME(t.Outdent)
    })

    unscopedTypeIdentifier = this.RULE("unscopedTypeIdentifier", () => {
        // TODO: Can we actually check here that it is unscoped?
        this.CONSUME(t.ScopedTypeIdentifier)
    })

    unscopedValueIdentifier = this.RULE("unscopedValueIdentifier", () => {
        // TODO: Can we actually check here that it is unscoped?
        this.CONSUME(t.ScopedValueIdentifier)
    })

    parameterizedType = this.RULE("parameterizedType", () => {
        this.AT_LEAST_ONE(() => {
            this.CONSUME(t.ScopedTypeIdentifier)
        })
    })

    typeParameters = this.RULE("typeParameters", () => {
        this.MANY(() => {
            this.SUBRULE(this.unscopedTypeIdentifier)
        })
    })

    typeArguments = this.RULE("typeArguments", () => {
        this.MANY(() => {
            this.CONSUME(t.ScopedTypeIdentifier)
        })
    })

    typeStatement = this.RULE("typeStatement", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.typeDefinition) },
            { ALT: () => this.SUBRULE(this.typeSpecialCall) },
        ])
    })

    typeDefinition = this.RULE("typeDefinition", () => {
        this.exportOrPrivate()
        this.CONSUME(t.Type)
        this.SUBRULE(this.unscopedTypeIdentifier)
        this.CONSUME(t.Is)
        this.OR2([
            { ALT: () => this.SUBRULE(this.parameterizedType) },
            { ALT: () => this.SUBRULE(this.functionCall) },
        ])
    })

    typeSpecialCall = this.RULE("typeSpecialCall", () => {
        this.CONSUME(t.Type)
        // This is specifically for `type given` and `type return`, but we'll sort that out later.
        this.SUBRULE(this.functionCall)
    })

    private exportOrPrivate() {
        this.OPTION(() => {
            this.OR([
                { ALT: () => this.CONSUME(t.Export) },
                { ALT: () => this.CONSUME(t.Private) },
            ])
        })
    }
}
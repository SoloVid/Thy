import { createToken, createTokenInstance, Lexer, CstParser, IToken } from "chevrotain"
import { allTokens } from "./lexer"
import * as t from "./lexer"


export class MobyParser extends CstParser {
    constructor() {
        super(allTokens, {
            maxLookahead: 20
        })

        this.performSelfAnalysis()
    }

    script = this.RULE("script", () => {
        this.MANY_SEP({
            SEP: t.Newline,
            DEF: () => {
                this.SUBRULE(this.statement)
            }
        })
    })

    statement = this.RULE("statement", () => {
        this.OR([
            { ALT: () => this.CONSUME(t.MultilineComment) },
            { ALT: () => this.CONSUME(t.Comment) },
            { ALT: () => this.SUBRULE(this.functionDefinition) },
            { ALT: () => this.SUBRULE(this.functionCallStatement) },
            { ALT: () => this.SUBRULE(this.constantAssignment) },
            { ALT: () => this.SUBRULE(this.variableAssignment) },
            { ALT: () => this.SUBRULE(this.declaration) },
            { ALT: () => this.SUBRULE(this.typeStatement) },
        ])
    })

    // unparsedStatement = this.RULE("unparsedStatement", () => {
    //     this.MANY(() => {
    //         this.OR([
    //             { ALT: () => this.CONSUME(t.And) },
    //             { ALT: () => this.CONSUME(t.Async) },
    //             { ALT: () => this.CONSUME(t.Be) },
    //             { ALT: () => this.CONSUME(t.Export) },
    //             { ALT: () => this.CONSUME(t.Fun) },
    //             { ALT: () => this.CONSUME(t.Is) },
    //             { ALT: () => this.CONSUME(t.To) },
    //             { ALT: () => this.CONSUME(t.Type) },
    //             { ALT: () => this.CONSUME(t.Yield) },
    //         ])
    //     })
    // })

    functionDefinition = this.RULE("functionDefinition", () => {
        this.exportOrPrivate()
        this.OPTION2(() => {
            this.CONSUME(t.Async)
        })
        this.CONSUME(t.Fun)
        this.SUBRULE(this.typeParameters)
        this.SUBRULE(this.unscopedValueIdentifier)
        this.SUBRULE(this.parameterizedType)
        this.SUBRULE(this.block)
    })

    functionCallStatement = this.RULE("functionCallStatement", () => {
        this.OPTION(() => {
            this.CONSUME(t.Yield)
        })
        this.SUBRULE(this.functionCall)
    })

    functionCall = this.RULE("functionCall", () => {
        this.CONSUME(t.ScopedValueIdentifier)
        this.SUBRULE(this.typeArguments)
        this.SUBRULE(this.argumentsRule)
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

    declaration = this.RULE("declaration", () => {
        this.exportOrPrivate()
        this.SUBRULE(this.unscopedValueIdentifier)
        this.CONSUME(t.Be)
        this.SUBRULE(this.parameterizedType)
    })

    argumentsRule = this.RULE("argumentsRule", () => {
        this.MANY(() => {
            this.SUBRULE(this.atomicExpression)
            this.OPTION(() => {
                this.SUBRULE(this.block)
                this.CONSUME(t.And)
                this.SUBRULE(this.argumentsRule)
            })
        })
    })

    atomicExpression = this.RULE("atomicExpression", () => {
        this.OR([
            { ALT: () => this.CONSUME(t.NumberLiteral) },
            { ALT: () => this.CONSUME(t.StringLiteral) },
            { ALT: () => this.CONSUME(t.ScopedValueIdentifier) },
        ])
    })

    block = this.RULE("block", () => {
        this.CONSUME(t.Indent)
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
            { ALT: () => this.SUBRULE(this.typeAliasDefinition) },
            { ALT: () => this.SUBRULE(this.typeGenericDefinition) },
            { ALT: () => this.SUBRULE(this.typeFunctionDefinition) },
        ])
    })

    typeAliasDefinition = this.RULE("typeAliasDefinition", () => {
        this.exportOrPrivate()
        this.CONSUME(t.Type)
        this.SUBRULE(this.unscopedTypeIdentifier)
        this.CONSUME(t.Is)
        this.SUBRULE(this.parameterizedType)
    })

    typeGenericDefinition = this.RULE("typeGenericDefinition", () => {
        this.CONSUME(t.Type)
        this.SUBRULE(this.unscopedTypeIdentifier)
        this.CONSUME(t.Be)
        this.SUBRULE(this.parameterizedType)
    })

    typeFunctionDefinition = this.RULE("typeFunctionDefinition", () => {
        this.exportOrPrivate()
        this.CONSUME(t.Type)
        this.CONSUME(t.Fun)
        this.SUBRULE(this.unscopedTypeIdentifier)
        this.SUBRULE(this.block)
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
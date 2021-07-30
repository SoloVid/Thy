import { CstParser } from "chevrotain"
import { TokenTypes } from "./token-types"

export class Parser extends CstParser {
    private readonly t: TokenTypes

    constructor(tokenTypes: TokenTypes) {
        super(tokenTypes.allTokens)
        this.t = tokenTypes

        this.performSelfAnalysis()
    }

    script = this.RULE("script", () => {
        this.MANY_SEP({
            SEP: this.t.StatementSeparator,
            DEF: () => {
                this.SUBRULE(this.statement)
            }
        })
    })

    statement = this.RULE("statement", () => {
        this.OR([
            { ALT: () => this.CONSUME(this.t.MultilineComment) },
            { ALT: () => this.CONSUME(this.t.Comment) },
            { ALT: () => this.SUBRULE(this.typeStatement) },
            { ALT: () => this.SUBRULE(this.constantAssignment) },
            { ALT: () => this.SUBRULE(this.variableAssignment) },
            { ALT: () => this.SUBRULE(this.variableDeclaration) },
            { ALT: () => this.SUBRULE(this.functionCallStatement) },
            // This case is primarily for blank lines.
            { ALT: () => {} },
        ])
    })

    functionCallStatement = this.RULE("functionCallStatement", () => {
        this.OPTION(() => {
            this.CONSUME(this.t.Yield)
        })
        this.SUBRULE(this.namedFunctionCall)
    })

    namedFunctionCall = this.RULE("namedFunctionCall", () => {
        this.CONSUME(this.t.ScopedValueIdentifier)
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
        this.CONSUME(this.t.Is)
        this.SUBRULE(this.functionCall)
    })

    variableAssignment = this.RULE("variableAssignment", () => {
        this.SUBRULE(this.unscopedValueIdentifier)
        this.CONSUME(this.t.To)
        this.SUBRULE(this.functionCall)
    })

    variableDeclaration = this.RULE("declaration", () => {
        this.exportOrPrivate()
        this.SUBRULE(this.unscopedValueIdentifier)
        this.CONSUME(this.t.Be)
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
            { ALT: () => this.CONSUME(this.t.NumberLiteral) },
            { ALT: () => this.CONSUME(this.t.StringLiteral) },
            { ALT: () => this.CONSUME(this.t.ScopedValueIdentifier) },
        ])
    })

    block = this.RULE("block", () => {
        this.CONSUME(this.t.StartBlock)
        this.SUBRULE(this.script)
        this.CONSUME(this.t.EndBlock)
    })

    unscopedTypeIdentifier = this.RULE("unscopedTypeIdentifier", () => {
        // TODO: Can we actually check here that it is unscoped?
        this.CONSUME(this.t.ScopedTypeIdentifier)
    })

    unscopedValueIdentifier = this.RULE("unscopedValueIdentifier", () => {
        // TODO: Can we actually check here that it is unscoped?
        this.CONSUME(this.t.ScopedValueIdentifier)
    })

    parameterizedType = this.RULE("parameterizedType", () => {
        this.AT_LEAST_ONE(() => {
            this.CONSUME(this.t.ScopedTypeIdentifier)
        })
    })

    typeParameters = this.RULE("typeParameters", () => {
        this.MANY(() => {
            this.SUBRULE(this.unscopedTypeIdentifier)
        })
    })

    typeArguments = this.RULE("typeArguments", () => {
        this.MANY(() => {
            this.CONSUME(this.t.ScopedTypeIdentifier)
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
        this.CONSUME(this.t.Type)
        this.SUBRULE(this.unscopedTypeIdentifier)
        this.CONSUME(this.t.Is)
        this.OR2([
            { ALT: () => this.SUBRULE(this.parameterizedType) },
            { ALT: () => this.SUBRULE(this.functionCall) },
        ])
    })

    typeSpecialCall = this.RULE("typeSpecialCall", () => {
        this.CONSUME(this.t.Type)
        // This is specifically for `type given` and `type return`, but we'll sort that out later.
        this.SUBRULE(this.functionCall)
    })

    private exportOrPrivate() {
        this.OPTION(() => {
            this.OR([
                { ALT: () => this.CONSUME(this.t.Export) },
                { ALT: () => this.CONSUME(this.t.Private) },
            ])
        })
    }
}
import type { CompileError } from "../compile-error"
import type { Token } from "../tokenizer/token"

// These context types are listed in order from most restrictive to most permissive.
export const contextType = {
    /**
     * Indicates we are within a "loose" (potentially ambiguous) expression (e.g. a binary logical operation).
     * Within this type of context, generated expressions need to remove any ambiguity from themselves.
     * Function call, literal, or identifier? Fine.
     * Binary operation? Wrap it in parens.
     */
    looseExpression: "looseExpression",
    /**
     * Indicates we are within an isolated expression (e.g. function parameter).
     * Within this type of context, generated expressions may assume isolation and forgo enclosing parens.
     */
    isolatedExpression: "isolatedExpression",
    /**
     * Are we within a part of the program that has the ability to return?
     * Within this type of context, generated code may actually be statements instead of just expressions.
     * These statements MAY NOT EFFECT A RETURN (e.g. `return` or `await` require IIFE wrapping).
     */
    blockNoReturn: "blockNoReturn",
    /**
     * Are we within a part of the program that has the ability to return?
     * Within this type of context, generated code may actually be statements
     * (including await and return) instead of just expressions.
     */
    blockAllowingReturn: "blockAllowingReturn",
} as const

export type ContextType = (typeof contextType)[keyof typeof contextType]

interface GeneratorStatePublicAttributes {
    context: ContextType
    indentLevel: number
    isTypeContext: boolean
}

export interface GeneratorState extends GeneratorStatePublicAttributes {
    /** Singleton(ish) array of errors encountered. */
    errors: CompileError[]
    localVariables: LocalVariable[]
    parent: GeneratorState | null
    addError(error: CompileError): void
    getUniqueVariableName(): string
    isExpressionContext(): boolean
    makeChild(overrides?: Partial<GeneratorStatePublicAttributes>): GeneratorState
}

export interface LocalVariable {
    token: Token
    name: string
    isConstant: boolean
}

export function makeGeneratorState(parent?: GeneratorState, overrides: Partial<GeneratorStatePublicAttributes> = {}): GeneratorState {
    let nextVar = 1
    const me = {
        errors: parent?.errors ?? [] as CompileError[],
        indentLevel: parent?.indentLevel ?? 0,
        isTypeContext: parent?.isTypeContext ?? false,
        getUniqueVariableName: parent?.getUniqueVariableName ?? (() => {
            return `_${nextVar++}`
        }),
        context: contextType.isolatedExpression as ContextType,
        localVariables: [],
        parent: parent ?? null,
        addError(error: CompileError) {
            this.errors.push(error)
        },
        isExpressionContext() {
            return this.context === contextType.looseExpression || this.context === contextType.isolatedExpression
        },
        makeChild(overrides: Partial<GeneratorStatePublicAttributes> = {}) {
            return makeGeneratorState(me, overrides)
        },
        ...overrides
    }
    return me
}

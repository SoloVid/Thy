import type { CompileError } from "../compile-error"
import type { Token } from "../tokenizer/token"
import type { Block, TreeNode } from "../tree"
import type { CodeGeneratorFunc, IndependentCodeGeneratorFunc } from "./generator"

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
    /**
     * Is it valid to export at this level?
     */
    blockAllowingExport: "blockAllowingExport",
} as const

export type ContextType = (typeof contextType)[keyof typeof contextType]

interface GeneratorStateOptions {
    readonly block?: Block
    readonly context?: ContextType
    readonly increaseIndent?: boolean
    readonly isTypeContext?: boolean
    readonly newImplicitArguments?: boolean
    readonly newPreStatementsArray?: boolean
}

export interface ImplicitArgumentsState {
    readonly variableName: string
    readonly used: boolean
    markImplicitArgumentUsed(): void
}

export interface GeneratorState {
    readonly block: Block | null
    readonly context: ContextType
    readonly indentLevel: number
    readonly isTypeContext: boolean
    /** Singleton(ish) array of errors encountered. */
    readonly errors: CompileError[]
    readonly preStatementGenerators: IndependentCodeGeneratorFunc[]
    readonly localVariables: LocalVariable[]
    readonly parent: GeneratorState | null
    readonly implicitArguments: ImplicitArgumentsState | null
    addError(error: CompileError): void
    /** Queue up a generator that needs to be run in a dedicated statement context prior to the current expression context. */
    addPreStatementGenerator(generator: IndependentCodeGeneratorFunc): void
    getUniqueVariableName(): string
    isExpressionContext(): boolean
    makeChild(options?: GeneratorStateOptions): GeneratorState
}

export interface LocalVariable {
    token: Token
    name: string
    isConstant: boolean
}

export function makeGeneratorState(parent?: GeneratorState, options: GeneratorStateOptions = {}): GeneratorState {
    let nextVar = 1
    const getUniqueVariableName = parent?.getUniqueVariableName ?? (() => {
        return `_${nextVar++}`
    })
    const me = {
        errors: parent?.errors ?? [] as CompileError[],
        preStatementGenerators: options.newPreStatementsArray ? [] : parent?.preStatementGenerators ?? [],
        indentLevel: (options.increaseIndent && parent) ? parent.indentLevel + 1 : parent?.indentLevel ?? 0,
        isTypeContext: options.isTypeContext !== undefined ? options.isTypeContext : parent?.isTypeContext ?? false,
        getUniqueVariableName,
        block: options.block ?? parent?.block ?? null,
        context: options.context !== undefined ? options.context : contextType.isolatedExpression as ContextType,
        localVariables: [],
        parent: parent ?? null,
        implicitArguments: options.newImplicitArguments ? {
            variableName: getUniqueVariableName(),
            used: false,
            markImplicitArgumentUsed() {
                this.used = true
                parent?.implicitArguments?.markImplicitArgumentUsed()
            }
        } : parent?.implicitArguments ?? null,
        addError(error: CompileError) {
            this.errors.push(error)
        },
        addPreStatementGenerator(generator: IndependentCodeGeneratorFunc) {
            this.preStatementGenerators.push(generator)
        },
        isExpressionContext() {
            return this.context === contextType.looseExpression || this.context === contextType.isolatedExpression
        },
        makeChild(options: GeneratorStateOptions = {}) {
            return makeGeneratorState(me, options)
        }
    }
    return me
}

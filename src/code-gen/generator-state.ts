import type { CompileError } from "../compile-error"
import type { Token } from "../tokenizer/token"

export interface GeneratorState {
    /** Singleton(ish) array of errors encountered. */
    errors: CompileError[]
    /** Are we within an expression? */
    expressionContext: boolean
    indentLevel: number
    localVariables: LocalVariable[]
    parent: GeneratorState | null
    /** Are we within a part of the program that has the ability to return? */
    returnContext: boolean
    addError(error: CompileError): void
    makeChild(): GeneratorState
}

export interface LocalVariable {
    token: Token
    name: string
    isConstant: boolean
}

export function makeGeneratorState(parent?: GeneratorState): GeneratorState {
    const me = {
        errors: [] as CompileError[],
        expressionContext: false,
        indentLevel: 0,
        returnContext: false,
        ...parent,
        localVariables: [],
        parent: parent ?? null,
        addError(error: CompileError) {
            this.errors.push(error)
        },
        makeChild() {
            return makeGeneratorState(me)
        }
    }
    return me
}

import type { Token } from "../tokenizer/token"

export interface GeneratorState {
    expressionContext: boolean
    indentLevel: number
    localVariables: LocalVariable[]
    parent: GeneratorState | null
    yieldContext: boolean
    makeChild(): GeneratorState
}

export interface LocalVariable {
    token: Token
    name: string
    isConstant: boolean
}

export function makeGeneratorState(parent?: GeneratorState): GeneratorState {
    const me = {
        expressionContext: false,
        indentLevel: 0,
        yieldContext: false,
        ...parent,
        localVariables: [],
        parent: parent ?? null,
        makeChild() {
            return makeGeneratorState(me)
        }
    }
    return me
}

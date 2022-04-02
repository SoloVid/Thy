import { tValueIdentifier } from "../tokenizer/token-type"
import type { Assignment } from "../tree/assignment"
import type { Call } from "../tree/call"
import type { Identifier } from "../tree/identifier"
import { LetCall } from "../tree/let-call"
import type { CodeGeneratorFunc, GeneratedSnippets } from "./generator"
import type { GeneratorState } from "./generator-state"

export interface SimpleCall extends Call {
    func: Identifier<typeof tValueIdentifier>
}

export interface GeneratorForGlobalSpec {
    name: string
    generateValue: (state: GeneratorState) => string
    generateCall?: CodeGeneratorFunc<SimpleCall>
    generateAssignment?: CodeGeneratorFunc<Assignment & {call: SimpleCall}>
    generateLetCall?: CodeGeneratorFunc<LetCall & {call: SimpleCall}>
}

export interface GeneratorForGlobalParentSpec {
    name: string
    children: readonly (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[]
}

export function isParent(spec: GeneratorForGlobalSpec | GeneratorForGlobalParentSpec): spec is GeneratorForGlobalParentSpec {
    return "children" in spec
}
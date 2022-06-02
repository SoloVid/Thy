import type { tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type"
import type { Atom, PropertyAccess, TypeCall } from "../tree"
import type { Assignment } from "../tree/assignment"
import type { Call } from "../tree/call"
import type { LetCall } from "../tree/let-call"
import type { CodeGeneratorFunc } from "./generator"
import type { GeneratorState } from "./generator-state"

export interface SimpleCall extends Call {
    func: Atom | PropertyAccess<never, typeof tValueIdentifier>
}

export interface SimpleTypeCall extends TypeCall {
    func: Atom | PropertyAccess<never, typeof tTypeIdentifier>
}

export interface GeneratorForGlobalSpec {
    name: string
    generateValue: (state: GeneratorState) => string
    generateTypeInstance?: (state: GeneratorState) => string
    generateCall?: CodeGeneratorFunc<SimpleCall>
    generateTypeCall?: CodeGeneratorFunc<SimpleTypeCall>
    generateAssignment?: CodeGeneratorFunc<Assignment & {call: SimpleCall}>
    generateLetCall?: CodeGeneratorFunc<LetCall & {call: SimpleCall}>
}

export interface GeneratorForGlobalParentSpec {
    name: string
    children: readonly (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[]
}

export function isLeaf(spec: GeneratorForGlobalSpec | GeneratorForGlobalParentSpec): spec is GeneratorForGlobalSpec {
    return "generateValue" in spec
}

export function isParent(spec: GeneratorForGlobalSpec | GeneratorForGlobalParentSpec): spec is GeneratorForGlobalParentSpec {
    return "children" in spec
}

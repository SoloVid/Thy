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

export interface ReallySimpleTypeCall extends SimpleTypeCall {
    args: (Atom<typeof tTypeIdentifier> | PropertyAccess<never, typeof tTypeIdentifier>)[]
}

export interface GeneratorForGlobalSpec {
    name: string
    /** At the end of the day, anything in Thy should be able to be represented as a value in TypeScript. What is that value? */
    generateValue: (state: GeneratorState) => string
    /** Generate a _**type**_. */
    generateTypeInstance?: (state: GeneratorState) => string
    generateCall?: CodeGeneratorFunc<SimpleCall>
    /**
     * This is basically just a variation on {@link generateCall} that specifically targets type calls.
     *
     * Since the default type-call generator ends up calling the call generator,
     * I'm not sure this is actually useful.
     */
    generateTypeCall?: CodeGeneratorFunc<SimpleTypeCall>
    /** Given a really simple type call (like `Union String Number`), generate a _**type**_. */
    generateSimpleTypeCall?: CodeGeneratorFunc<ReallySimpleTypeCall>
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

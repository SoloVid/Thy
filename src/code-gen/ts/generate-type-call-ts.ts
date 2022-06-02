import { nodeError, TreeNode } from "../../tree/tree-node";
import type { TypeCall } from "../../tree/type-call";
import { fromTokenRange, GeneratedSnippets, GeneratorFixture } from "../generator";
import type { GeneratorState } from "../generator-state";
import { generateCallTs } from "./call/generate-call-ts";

export function tryGenerateDanglingTypeCallTs(node: TreeNode, state: GeneratorState): void | GeneratedSnippets {
    if (node.type === "type-call") {
        return generateDanglingTypeCallTs(node, state)
    }
}

export function generateDanglingTypeCallTs(tc: TypeCall, state: GeneratorState): GeneratedSnippets {
    state.addError(nodeError(tc, "Unrecognized dangling type call"))
    return fromTokenRange(tc, "void \"invalid type call\"")
}

export function generateTypeCallTs(node: TypeCall, state: GeneratorState, fixture: GeneratorFixture, callName?: string): GeneratedSnippets {
    const fromStandardLib = fixture.standardLibrary.typeCallGenerator(node, state, fixture)
    if (fromStandardLib !== undefined) {
        return fromStandardLib
    }
    return generateCallTs({
        ...node,
        type: "call",
        typeArgs: []
    }, state, fixture, callName)
}

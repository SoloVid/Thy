import { assert } from "console";
import type { TreeNode } from "../tree/tree-node";
import { generateTs } from "./generate-ts";
import type { GeneratorState } from "./generator-state";

export function tryGenerateDefTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type !== "call") {
        return
    }
    if (node.func.type !== "atom") {
        return
    }
    if (node.func.token.text !== "def") {
        return
    }
    // TODO: better error handling
    assert(node.args.length === 1)
    const childState = state.makeChild()
    childState.indentLevel++
    // TODO: Handle type parameter.
    return generateTs(node.args[0], childState)
}

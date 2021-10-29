import { TreeNode } from "../tree/tree-node";
import { TypeCall } from "../tree/type-call";
import { GeneratorState } from "./generator-state";

export function tryGenerateTypeCallTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "type-call") {
        return generateTypeCallTs(node, state)
    }
}

export function generateTypeCallTs(ta: TypeCall, state: GeneratorState): string {
    return "<type call>"
}

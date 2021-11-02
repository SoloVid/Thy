import type { TreeNode } from "../tree/tree-node";
import type { GeneratorState } from "./generator-state";

export function tryGenerateBlankLineTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "blank-line") {
        return ""
    }
}

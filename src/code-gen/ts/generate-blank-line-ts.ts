import type { TreeNode } from "../../tree/tree-node";
import type { GeneratedSnippets } from "../generator";
import type { GeneratorState } from "../generator-state";

export function tryGenerateBlankLineTs(node: TreeNode, state: GeneratorState): void | GeneratedSnippets {
    if (node.type === "blank-line") {
        return { text: "\n" }
    }
}

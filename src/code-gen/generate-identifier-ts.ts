import type { TreeNode } from "../tree/tree-node";
import type { GeneratorState } from "./generator-state";

export function tryGenerateIdentifierTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "identifier") {
        const arr = [...node.scopes.map(t => t.text), node.target.text]
        return arr.join(".")
    }
}

import type { Atom } from "../tree/atom";
import type { TreeNode } from "../tree/tree-node";
import type { GeneratorState } from "./generator-state";

export function tryGenerateAtomTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "atom") {
        return generateAtomTs(node, state)
    }
}

export function generateAtomTs(atom: Atom, state: GeneratorState): string {
    return atom.token.text
}

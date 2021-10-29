import { Atom } from "../tree/atom";
import { TreeNode } from "../tree/tree-node";
import { GeneratorState } from "./generator-state";

export function tryGenerateAtomTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "atom") {
        return generateAtomTs(node, state)
    }
}

export function generateAtomTs(atom: Atom, state: GeneratorState): string {
    return atom.token.text
}

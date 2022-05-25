import type { Atom } from "../../tree/atom";
import { nodeError, PropertyAccess, TreeNode } from "../../tree";
import { fromComplicated, fromNode, fromToken, GeneratedSnippets, GeneratorFixture } from "../generator";
import type { GeneratorState } from "../generator-state";
import { generateAtomTs } from "./atom/generate-atom-ts";
import { generatePropertyAccessTs } from "./generate-property-access-ts";
import type { ErrorableTreeNode } from "../../tree/tree-node";

export function checkAndGenerateTypeInstanceTs(node: ErrorableTreeNode, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    if (node.type === "atom") {
        return [fromToken(node.token, "typeof "), generateAtomTs(node, state)]
    }
    if (node.type !== "property-access") {
        state.addError(nodeError(node, "Expected type instance"))
        return fromNode(node, "unknown")
    }
    return fromComplicated(node, ["typeof ", generatePropertyAccessTs(node, state, fixture)])
}

export function generateTypeInstanceTs(node: Atom | PropertyAccess<never>, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    if (node.type === "atom") {
        return [fromToken(node.token, "typeof "), generateAtomTs(node, state)]
    }
    return fromComplicated(node, ["typeof ", generatePropertyAccessTs(node, state, fixture)])
}

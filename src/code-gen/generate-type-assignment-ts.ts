import type { TreeNode } from "../tree/tree-node";
import type { TypeAssignment } from "../tree/type-assignment";
import type { GeneratorState } from "./generator-state";

export function tryGenerateTypeAssignmentTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "type-assignment") {
        return generateTypeAssignmentTs(node, state)
    }
}

export function generateTypeAssignmentTs(ta: TypeAssignment, state: GeneratorState): string {
    return "<type assignment>"
}

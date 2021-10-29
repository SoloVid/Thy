import { TreeNode } from "../tree/tree-node";
import { TypeAssignment } from "../tree/type-assignment";
import { GeneratorState } from "./generator-state";

export function tryGenerateTypeAssignmentTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "type-assignment") {
        return generateTypeAssignmentTs(node, state)
    }
}

export function generateTypeAssignmentTs(ta: TypeAssignment, state: GeneratorState): string {
    return "<type assignment>"
}

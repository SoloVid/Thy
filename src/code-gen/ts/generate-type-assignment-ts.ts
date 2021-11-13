import type { TreeNode } from "../../tree/tree-node";
import type { TypeAssignment } from "../../tree/type-assignment";
import { fromTokenRange, GeneratedSnippets } from "../generator";
import type { GeneratorState } from "../generator-state";

export function tryGenerateTypeAssignmentTs(node: TreeNode, state: GeneratorState): void | GeneratedSnippets {
    if (node.type === "type-assignment") {
        return generateTypeAssignmentTs(node, state)
    }
}

export function generateTypeAssignmentTs(ta: TypeAssignment, state: GeneratorState): GeneratedSnippets {
    // TODO: Generate legit type assignment.
    return fromTokenRange(ta, "<type assignment>")
}

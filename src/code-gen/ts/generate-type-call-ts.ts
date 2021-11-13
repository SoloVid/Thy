import type { TreeNode } from "../../tree/tree-node";
import type { TypeCall } from "../../tree/type-call";
import { fromTokenRange, GeneratedSnippets } from "../generator";
import type { GeneratorState } from "../generator-state";

export function tryGenerateTypeCallTs(node: TreeNode, state: GeneratorState): void | GeneratedSnippets {
    if (node.type === "type-call") {
        return generateTypeCallTs(node, state)
    }
}

export function generateTypeCallTs(tc: TypeCall, state: GeneratorState): GeneratedSnippets {
    // TODO: Generate legit type call.
    return fromTokenRange(tc, "<type call>")
}

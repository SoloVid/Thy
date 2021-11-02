import { TreeNode } from "../tree/tree-node";
import { YieldCall } from "../tree/yield-call";
import { generateTs } from "./generate-ts";
import { GeneratorState } from "./generator-state";

export function tryGenerateYieldCallTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "yield-call") {
        return generateYieldCallTs(node, state)
    }
}

export function generateYieldCallTs(yieldCall: YieldCall, state: GeneratorState): string {
    // TODO: Actually generate yield logic
    return `yield ${generateTs(yieldCall.call, state)}`
}

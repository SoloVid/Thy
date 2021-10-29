import { Call } from "../tree/call";
import { TreeNode } from "../tree/tree-node";
import { generateTs } from "./generate-ts";
import { GeneratorState } from "./generator-state";

export function tryGenerateCallTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "call") {
        return generateCallTs(node, state)
    }
}

export function generateCallTs(call: Call, state: GeneratorState): string {
    if (call.func.type === 'block') {
        return '<IIFE>'
    }

    const childState: GeneratorState = {
        indentLevel: state.indentLevel + 1
    }

    const argStrings = call.args.map(a => generateTs(a, childState))
    return `${call.func.token.text}(${argStrings.join(', ')})`
}

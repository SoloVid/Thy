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
    const childState = state.makeChild()
    childState.indentLevel++
    childState.expressionContext = true

    if (call.func.type === 'block') {
        return "(" + generateTs(call.func, childState) + ")()"
    }

    const functionString = generateTs(call.func)
    const argStrings = call.args.map(a => generateTs(a, childState))
    return `${functionString}(${argStrings.join(', ')})`
}

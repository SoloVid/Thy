import { Block } from "../tree/block";
import { TreeNode } from "../tree/tree-node";
import { generateTs } from "./generate-ts";
import { GeneratorState } from "./generator-state";
import { indentString, makeIndent } from "./indent-string";

export function tryGenerateBlockTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "block") {
        return generateBlockTs(node, state)
    }
}

export function generateBlockTs(block: Block, state: GeneratorState): string {
    if (state.indentLevel === 0) {
        return generateBlockLinesTs(block.ideas, state)
    }
    const childState = {
        indentLevel: state.indentLevel + 1
    }
    return `() => {\n${generateBlockLinesTs(block.ideas, state)}\n${makeIndent(state.indentLevel - 1)}}`
}

export function generateBlockLinesTs(ideas: Block["ideas"], state: GeneratorState): string {
    const childState: GeneratorState = {
        indentLevel: state.indentLevel + 1
    }

    // const lines = ideas.map(i => indentString(generateTs(i, childState), state.indentLevel))
    const lines = ideas.map(i => makeIndent(state.indentLevel) + generateTs(i, state))

    return lines.join("\n")
}

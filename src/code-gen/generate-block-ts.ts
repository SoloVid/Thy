import type { Block } from "../tree/block";
import type { TreeNode } from "../tree/tree-node";
import { generateTs } from "./generate-ts";
import type { GeneratorState } from "./generator-state";
import { makeIndent } from "./indent-string";

export function tryGenerateBlockTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "block") {
        return generateBlockTs(node, state)
    }
}

export function generateBlockTs(block: Block, state: GeneratorState): string {
    if (state.indentLevel === 0) {
        return generateBlockLinesTs(block.ideas, state) + "\n"
    }
    
    const parameterSpecs: string[] = []
    const imperativeIdeas: Block["ideas"] = []
    for (const idea of block.ideas) {
        const ps = getParameterSpec(idea)
        if (ps === null) {
            imperativeIdeas.push(idea)
        } else {
            parameterSpecs.push(ps)
        }
    }

    return `(${parameterSpecs.join(", ")}) => {\n${generateBlockLinesTs(imperativeIdeas, state)}\n${makeIndent(state.indentLevel - 1)}}`
}

function getParameterSpec(node: TreeNode): string | null {
    // TODO: Also support `given` call without assignment (ignored parameter)
    if (node.type !== "assignment") {
        return null
    }
    if (node.call.func.type !== "atom") {
        return null
    }
    if (node.call.func.token.text !== "given") {
        return null
    }
    // TODO: Add type information
    // TODO: Validate unscoped
    return `${node.variable.target.text}`
}

export function generateBlockLinesTs(ideas: Block["ideas"], state: GeneratorState): string {
    const childState = state.makeChild()
    // childState.indentLevel++
    childState.expressionContext = false
    childState.yieldContext = false

    const lines = ideas.map(i => generateTs(i, childState))
    if (childState.localVariables.length > 0) {
        const impliedReturn = childState.localVariables.map(v => {
            const ind = makeIndent(childState.indentLevel + 1)
            if (v.isConstant) {
                return ind + v.name
            }
            return `${ind}get ${v.name}() { return ${v.name} },\n${ind}set ${v.name}(__) { ${v.name} = __ }`
        })
        lines.push(`return {\n${impliedReturn.join(",\n")}\n${makeIndent(state.indentLevel)}}`)
    }

    // const lines = ideas.map(i => indentString(generateTs(i, childState), state.indentLevel))
    // const lines = ideas.map(i => makeIndent(state.indentLevel) + generateTs(i, state))

    return lines.map(l => makeIndent(state.indentLevel) + l).join("\n")
}

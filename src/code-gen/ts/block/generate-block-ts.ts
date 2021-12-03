import type { Block } from "../../../tree/block";
import type { TreeNode } from "../../../tree/tree-node";
import { generateTs } from "../generate-ts";
import { contextType, GeneratorState } from "../../generator-state";
import { genIndent, makeIndent } from "../../indent-string";
import { fromComplicated, fromToken, fromTokenRange, GeneratedSnippet, GeneratedSnippets } from "../../generator";

export function tryGenerateBlockTs(node: TreeNode, state: GeneratorState): void | GeneratedSnippets {
    if (node.type === "block") {
        return generateBlockTs(node, state)
    }
}

export function generateBlockTs(block: Block, state: GeneratorState): GeneratedSnippets {
    if (state.indentLevel === 0) {
        return generateBlockLinesTs(block, block.ideas, state)
    }
    
    const parameterSpecs: GeneratedSnippet[] = []
    const imperativeIdeas: Block["ideas"] = []
    for (const idea of block.ideas) {
        const ps = getParameterSpec(idea)
        if (ps === null) {
            imperativeIdeas.push(idea)
        } else {
            if (parameterSpecs.length > 0) {
                parameterSpecs.push(fromTokenRange(block, ", "))
            }
            parameterSpecs.push(ps)
        }
    }

    return fromComplicated(block, [
        "(", parameterSpecs, ") => {\n",
        generateBlockLinesTs(block, imperativeIdeas, state),
        makeIndent(state.indentLevel - 1), "}"
    ])
}

function getParameterSpec(node: TreeNode): GeneratedSnippet | null {
    // TODO: Also support `given` call without assignment (ignored parameter)
    if (node.type !== "assignment") {
        return null
    }
    if (node.call.func.type !== "identifier") {
        return null
    }
    if (node.call.func.target.text !== "given") {
        return null
    }
    // TODO: Add type information
    // TODO: Validate unscoped
    return fromToken(node.variable.target)
}

export function generateBlockLinesTs(block: Block, ideas: Block["ideas"], state: GeneratorState): GeneratedSnippets {
    const childState = state.makeChild({
        context: contextType.blockAllowingReturn
    })

    const lines = ideas.map(i => generateTs(i, childState))
    if (childState.localVariables.length > 0) {
        const impliedReturn = childState.localVariables.map(v => {
            const ind = genIndent(childState.indentLevel + 1)
            const genT = fromToken(v.token, v.name)
            if (v.isConstant) {
                return [ind, genT]
            }
            return fromComplicated(block, [
                ind, "get ", genT, "() { return ", genT, " },\n",
                ind, "set ", genT, "(__) { ", genT, " = __ }",
            ])
        })
        lines.push(fromComplicated(block, [
            "return {\n",
            impliedReturn,
            "\n",
            genIndent(state.indentLevel),
            "}",
        ]))
    }

    return lines.map(l => [genIndent(state.indentLevel), l, { text: "\n" }])
}

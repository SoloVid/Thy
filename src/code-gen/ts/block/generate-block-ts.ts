import type { Block } from "../../../tree/block";
import type { TreeNode } from "../../../tree/tree-node";
import { contextType, GeneratorState } from "../../generator-state";
import { genIndent, makeIndent } from "../../indent-string";
import { fromComplicated, fromToken, fromTokenRange, GeneratedSnippet, GeneratedSnippets, GeneratorFixture } from "../../generator";

export function tryGenerateBlockTs(node: TreeNode, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets {
    if (node.type === "block") {
        return generateBlockTs(node, state, fixture)
    }
}

export function generateBlockTs(block: Block, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    if (state.indentLevel === 0 && state.context === contextType.blockAllowingReturn) {
        return generateBlockLinesTs(block, block.ideas, state, fixture)
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

    const blockBodyState = state.makeChild({ indentLevel: state.indentLevel + 1 })
    const definition = fromComplicated(block, [
        "(", parameterSpecs, ") => {\n",
        generateBlockLinesTs(block, imperativeIdeas, blockBodyState, fixture),
        makeIndent(state.indentLevel), "}"
    ])

    if (state.context === contextType.looseExpression) {
        return fromComplicated(block, ["(", definition, ")"])
    }
    return definition
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

export function generateBlockLinesTs(block: Block, ideas: Block["ideas"], state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const childState = state.makeChild({
        context: contextType.blockAllowingReturn
    })

    const implementationLines = ideas.map(i => i.type === "blank-line" ? { text: "\n" } : [
        genIndent(state.indentLevel), fixture.generate(i, childState), { text: "\n" }
    ])
    const impliedLines: GeneratedSnippets = []
    // TODO: Get local variables stuff working again (probably from tree symbol table?)
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
        impliedLines.push(fromComplicated(block, [
            genIndent(state.indentLevel), "return {\n",
            impliedReturn, "\n",
            genIndent(state.indentLevel), "}\n",
        ]))
    }

    return [implementationLines, impliedLines]
}

import type { Block } from "../../../tree/block";
import { nodeError, TreeNode } from "../../../tree/tree-node";
import { contextType, GeneratorState } from "../../generator-state";
import { genIndent, makeIndent } from "../../indent-string";
import { fromComplicated, fromToken, fromTokenRange, GeneratedSnippet, GeneratedSnippets, GeneratorFixture } from "../../generator";
import { checkAndGenerateTypeInstanceTs, generateTypeInstanceTs } from "../generate-type-instance-ts";
import assert from "assert";

export function tryGenerateBlockTs(node: TreeNode, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets {
    if (node.type === "block") {
        return generateBlockTs(node, state, fixture)
    }
}

export function generateBlockTs(block: Block, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    if (state.indentLevel === 0 && state.context === contextType.blockAllowingExport) {
        return generateBlockLinesTs(block, block.ideas, state, fixture)
    }
    
    const typeParameterSpecs: GeneratedSnippets = []
    const parameterSpecs: GeneratedSnippets = []
    let returnTypeSpec: GeneratedSnippets | null = null
    const blockStartLineSnippets: GeneratedSnippets = []
    const imperativeIdeas: Block["ideas"] = []
    for (const idea of block.ideas) {
        const tps = getTypeParameterSpec(idea, state, fixture);
        if (tps !== null) {
            if (typeParameterSpecs.length > 0) {
                typeParameterSpecs.push(fromTokenRange(block, ", "))
            }
            typeParameterSpecs.push(tps.inlineParamSnippet)
            blockStartLineSnippets.push(tps.blockSnippet)
            continue
        }

        const ps = getParameterSpec(idea, state, fixture)
        if (ps !== null) {
            if (parameterSpecs.length > 0) {
                parameterSpecs.push(fromTokenRange(block, ", "))
            }
            parameterSpecs.push(ps)
            continue
        }

        const rts = getReturnTypeSpec(idea, state, fixture)
        if (rts !== null) {
            if (returnTypeSpec === null) {
                returnTypeSpec = rts
            } else {
                assert(idea.type === "type-call")
                state.addError(nodeError(idea, "type return already specified"))
            }
            continue
        }

        imperativeIdeas.push(idea)
    }

    const blockBodyState = state.makeChild({ context: contextType.blockAllowingReturn, increaseIndent: true, newImplicitArguments: parameterSpecs.length === 0 })
    let linesTs = generateBlockLinesTs(block, imperativeIdeas, blockBodyState, fixture)

    if (parameterSpecs.length === 0 && blockBodyState.implicitArguments?.used) {
        const n = blockBodyState.implicitArguments.variableName
        const localName = n + "L"
        parameterSpecs.push(fromTokenRange(block, localName))
        const space = makeIndent(blockBodyState.indentLevel)
        const parentObj = state.implicitArguments?.variableName ?? "{}"
        linesTs = [fromTokenRange(block, `${space}const ${n} = {...${localName}, ...${parentObj}} as const\n`), linesTs]
    }

    const definition = fromComplicated(block, [
        ...(typeParameterSpecs.length === 0 ? [] : ["<", typeParameterSpecs, ">"]),
        "(", parameterSpecs, ")", returnTypeSpec ?? [], " => {\n",
        ...blockStartLineSnippets.map(s => [makeIndent(state.indentLevel + 1), s, "\n"]).flat(),
        linesTs,
        makeIndent(state.indentLevel), "}"
    ])

    if (state.context === contextType.looseExpression) {
        return fromComplicated(block, ["(", definition, ")"])
    }
    return definition
}

function getTypeParameterSpec(
    node: TreeNode,
    state: GeneratorState,
    fixture: GeneratorFixture
): { inlineParamSnippet: GeneratedSnippets, blockSnippet: GeneratedSnippets } | null {
    if (node.type !== "type-assignment") {
        return null
    }
    if (node.call.func.type !== "atom") {
        return null
    }
    if (node.call.type !== 'type-call' || node.call.func.token.text !== "Given") {
        return null
    }

    for (const arg of node.call.args.slice(2)) {
        state.addError(nodeError(arg, `Given cannot take more than 2 arguments`))
    }

    const paramName = `_${node.variable.text}_Param`
    const inlineParamSnippet: GeneratedSnippets[] = [fromToken(node.variable, paramName)]
    if (node.call.args.length > 0) {
        const extendedTypeSnippet = checkAndGenerateTypeInstanceTs(node.call.args[0], state, fixture)
        inlineParamSnippet.push(fromComplicated(node.call.args[0], [' extends ', extendedTypeSnippet]))

        if (node.call.args.length > 1) {
            const defaultTypeSnippet = checkAndGenerateTypeInstanceTs(node.call.args[1], state, fixture)
            inlineParamSnippet.push(fromComplicated(node.call.args[1], [' = ', defaultTypeSnippet]))
        }
    }

    return {
        inlineParamSnippet: inlineParamSnippet,
        blockSnippet: fromComplicated(node, ['const ', node.variable.text, ' = undefined as unknown as ', paramName])
    }
}

function getParameterSpec(node: TreeNode, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets | null {
    // TODO: Also support `given` call without assignment (ignored parameter)
    // TODO: Decide and implement support for non-constant assignments
    if (node.type !== "assignment") {
        return null
    }
    if (node.call.func.type !== "atom") {
        return null
    }
    if (node.call.func.token.text !== "given") {
        return null
    }
    // TODO: Support property access here
    if (node.variable.type !== "atom") {
        return null
    }

    for (const typeArg of node.call.typeArgs.slice(1)) {
        state.addError(nodeError(typeArg, `given cannot take more than 1 type argument`))
    }

    for (const arg of node.call.args.slice(1)) {
        state.addError(nodeError(arg, `given cannot take more than 1 argument`))
    }

    const typeSnippet = node.call.typeArgs.length === 0 ? [] : [": ", generateTypeInstanceTs(node.call.typeArgs[0], state, fixture)]
    const defaultValueSnippet = node.call.args.length === 0 ? [] : [" = ", fixture.generate(node.call.args[0], state.makeChild({ context: contextType.isolatedExpression }))]
    return fromComplicated(node, [fromToken(node.variable.token), ...typeSnippet, ...defaultValueSnippet])
}

function getReturnTypeSpec(
    node: TreeNode,
    state: GeneratorState,
    fixture: GeneratorFixture
): GeneratedSnippets | null {
    if (node.type !== "type-call") {
        return null
    }
    if (node.func.type !== "atom") {
        return null
    }
    if (node.func.token.text !== "return") {
        return null
    }

    if (node.args.length === 0) {
        state.addError(nodeError(node.func, `type return requires 1 argument`))
        return fromComplicated(node, [": undefined"])
    }

    for (const arg of node.args.slice(1)) {
        state.addError(nodeError(arg, `type return cannot take more than 1 argument`))
    }

    return fromComplicated(node, [": ", checkAndGenerateTypeInstanceTs(node.args[0], state, fixture)])
}

export function generateBlockLinesTs(block: Block, ideas: Block["ideas"], state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const implementationLines = ideas.map(i => i.type === "blank-line" ? { text: "\n" } : [
        genIndent(state.indentLevel), fixture.generate(i, state), { text: "\n" }
    ])
    const impliedLines: GeneratedSnippets = []
    // TODO: Get local variables stuff working again (probably from tree symbol table?)
    if (state.localVariables.length > 0) {
        const impliedReturn = state.localVariables.map(v => {
            const ind = genIndent(state.indentLevel + 1)
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

import type { Block } from "../../../tree/block";
import { nodeError, TreeNode } from "../../../tree/tree-node";
import { contextType, GeneratorState } from "../../generator-state";
import { genIndent, makeIndent } from "../../indent-string";
import { fromComplicated, fromNode, fromToken, fromTokenRange, GeneratedSnippet, GeneratedSnippets, GeneratorFixture, IndependentCodeGeneratorFunc } from "../../generator";
import { checkAndGenerateTypeInstanceTs, generateTypeInstanceTs } from "../generate-type-instance-ts";
import assert from "assert";
import type { Call, TypeCall } from "../../../tree";

export function tryGenerateBlockTs(node: TreeNode, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets {
    if (node.type === "block") {
        return generateBlockTs(node, state, fixture)
    }
}

export function generateBlockTs(block: Block, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    if (state.indentLevel === 0 && state.context === contextType.blockAllowingExport) {
        return generateBlockLinesTs(block, block.ideas, state, fixture)
    }
    
    let preludeTypeSnippetsDone = false
    const parameterSpecs: GeneratedSnippets = []
    let returnTypeSpec: GeneratedSnippets | null = null
    let preludeTypeInfo: PreludeTypeInfo = {
        typeParameters: [],
        typeSnippets: [],
    }
    const imperativeIdeas: Block["ideas"] = []
    for (const idea of block.ideas) {
        const tps = getTypeParameterSpec(idea, state, fixture, preludeTypeInfo);
        if (tps !== null) {
            let inlineSnippets = preludeTypeInfo.typeParameters.length > 0
                ? [fromTokenRange(block, ", "), tps.inlineParamSnippet]
                : tps.inlineParamSnippet
            preludeTypeInfo = {
                typeParameters: [...preludeTypeInfo.typeParameters, {
                    name: tps.paramName,
                    inlineSnippet: inlineSnippets,
                }],
                typeSnippets: [...preludeTypeInfo.typeSnippets, tps.blockSnippet],
            }
            continue
        }
        if (!preludeTypeSnippetsDone && idea.type === "type-assignment") {
            const gen = fixture.generate(idea, state)
            preludeTypeInfo = {
                typeParameters: preludeTypeInfo.typeParameters,
                typeSnippets: [...preludeTypeInfo.typeSnippets, gen],
            }
            continue
        }
        preludeTypeSnippetsDone = true

        const ps = getParameterSpec(idea, state, fixture, preludeTypeInfo)
        if (ps !== null) {
            if (parameterSpecs.length > 0) {
                parameterSpecs.push(fromTokenRange(block, ", "))
            }
            parameterSpecs.push(ps)
            continue
        }

        const rts = getReturnTypeSpec(idea, state, fixture, preludeTypeInfo)
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
        ...(preludeTypeInfo.typeParameters.length === 0
            ? [] : ["<", preludeTypeInfo.typeParameters.map(tp => tp.inlineSnippet), ">"]),
        "(", parameterSpecs, ")", returnTypeSpec ?? [], " => {\n",
        ...preludeTypeInfo.typeSnippets.map(s => [makeIndent(state.indentLevel + 1), s, "\n"]).flat(),
        linesTs,
        makeIndent(state.indentLevel), "}",
    ])

    if (state.context === contextType.looseExpression) {
        return fromComplicated(block, ["(", definition, ")"])
    }
    return definition
}

type PreludeTypeInfo = {
    typeParameters: readonly { readonly name: string, readonly inlineSnippet: GeneratedSnippets }[]
    typeSnippets: readonly GeneratedSnippets[]
}

function generateTypeParams(node: TreeNode, preludeTypeInfo: PreludeTypeInfo): {
    params: GeneratedSnippets,
    args: GeneratedSnippets
} {
    if (preludeTypeInfo.typeParameters.length === 0) {
        return { params: fromNode(node, ""), args: fromNode(node, "") }
    }
    return {
        params: fromComplicated(node, ["<", preludeTypeInfo.typeParameters.map(tp => tp.inlineSnippet), ">"]),
        args: fromComplicated(node, [
            "<", fromNode(node, preludeTypeInfo.typeParameters.map(tp => tp.name).join(", ")), ">"
        ]),
    }
}

function generatePreStatementAndTypeForParam(
    givenCallNode: Call | TypeCall,
    state: GeneratorState,
    fixture: GeneratorFixture,
    preludeTypeInfo: PreludeTypeInfo,
    name?: string,
) {
    const typeNode = givenCallNode.type === 'call' ? givenCallNode.typeArgs[0] : givenCallNode.args[0]
    const intermediateName = (name ? `_${name}` : state.getUniqueVariableName()) + "_TypePackage"
    const intermediateTypeParams = generateTypeParams(givenCallNode, preludeTypeInfo)
    const extendedTypeSnippet = checkAndGenerateTypeInstanceTs(typeNode, state, fixture)

    state.addPreStatementGenerator((s, f) => {
        const indent = makeIndent(s.indentLevel)
        const indent2 = makeIndent(s.indentLevel + 1)
        return fromComplicated(givenCallNode, [
            `class ${intermediateName}`, intermediateTypeParams.params, ` { f() {\n`,
            preludeTypeInfo.typeSnippets.map(snippet => fromComplicated(givenCallNode, [indent2, snippet, "\n"])),
            indent2, `return undefined as unknown as `, extendedTypeSnippet, "\n",
            indent, `} }`
        ])
    })

    return fromComplicated(typeNode, [
        'ReturnType<', intermediateName, intermediateTypeParams.args, `["f"]>`
    ])
}

function getTypeParameterSpec(
    node: TreeNode,
    state: GeneratorState,
    fixture: GeneratorFixture,
    preludeTypeInfo: PreludeTypeInfo,
): { paramName: string, inlineParamSnippet: GeneratedSnippets, blockSnippet: GeneratedSnippets } | null {
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
        // const intermediateName = `_${node.variable.text}_SuperPackage`
        // const intermediateTypeParams = generateTypeParams(node, preludeTypeInfo)
        // const extendedTypeSnippet = checkAndGenerateTypeInstanceTs(node.call.args[0], state, fixture)

        // state.addPreStatementGenerator((s, f) => {
        //     const indent = makeIndent(s.indentLevel)
        //     const indent2 = makeIndent(s.indentLevel + 1)
        //     return fromComplicated(node, [
        //         `class ${intermediateName}`, intermediateTypeParams.params, ` { f() {\n`,
        //         preludeTypeInfo.typeSnippets.map(snippet => fromComplicated(node, [indent2, snippet, "\n"])),
        //         indent2, `return undefined as unknown as `, extendedTypeSnippet, "\n",
        //         indent, `} }`
        //     ])
        // })

        // inlineParamSnippet.push(fromComplicated(node.call.args[0], [
        //     ' extends ReturnType<', intermediateName, intermediateTypeParams.args, `["f"]>`
        // ]))

        inlineParamSnippet.push(fromComplicated(node.call.args[0], [
            ' extends ', generatePreStatementAndTypeForParam(node.call, state, fixture, preludeTypeInfo, node.variable.text)
        ]))

        if (node.call.args.length > 1) {
            const defaultTypeSnippet = checkAndGenerateTypeInstanceTs(node.call.args[1], state, fixture)
            inlineParamSnippet.push(fromComplicated(node.call.args[1], [' = ', defaultTypeSnippet]))
        }
    }

    return {
        paramName: paramName,
        inlineParamSnippet: inlineParamSnippet,
        blockSnippet: fromComplicated(node, ['const ', node.variable.text, ' = undefined as unknown as ', paramName])
    }
}

function getParameterSpec(
    node: TreeNode,
    state: GeneratorState,
    fixture: GeneratorFixture,
    preludeTypeInfo: PreludeTypeInfo,
): GeneratedSnippets | null {
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

    const typeInstanceSnippet = preludeTypeInfo.typeSnippets.length === 0
        ? generateTypeInstanceTs(node.call.typeArgs[0], state, fixture)
        : generatePreStatementAndTypeForParam(node.call, state, fixture, preludeTypeInfo, node.variable.token.text)
    const typeSnippet = node.call.typeArgs.length === 0 ? [] : [": ", typeInstanceSnippet]
    const defaultValueSnippet = node.call.args.length === 0 ? [] : [" = ", fixture.generate(node.call.args[0], state.makeChild({ context: contextType.isolatedExpression }))]
    return fromComplicated(node, [fromToken(node.variable.token), ...typeSnippet, ...defaultValueSnippet])
}

function getReturnTypeSpec(
    node: TreeNode,
    state: GeneratorState,
    fixture: GeneratorFixture,
    preludeTypeInfo: PreludeTypeInfo,
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

    const typeInstanceSnippet = preludeTypeInfo.typeSnippets.length === 0
        ? checkAndGenerateTypeInstanceTs(node.args[0], state, fixture)
        : generatePreStatementAndTypeForParam(node, state, fixture, preludeTypeInfo)
    return fromComplicated(node, [": ", typeInstanceSnippet])
}

function resolvePreStatementGenerator(generator: IndependentCodeGeneratorFunc, state: GeneratorState, fixture: GeneratorFixture): readonly GeneratedSnippets[] {
    const lineState = state.makeChild({ context: contextType.blockNoReturn, newPreStatementsArray: true })
    const directSnippet = generator(lineState, fixture)
    if (lineState.preStatementGenerators.length === 0) {
        return [directSnippet]
    }
    const resolvedPreStatements = lineState.preStatementGenerators.map(g => resolvePreStatementGenerator(g, state, fixture))
    return [...resolvedPreStatements.flat(1), directSnippet]
}

export function generateBlockLinesTs(block: Block, ideas: Block["ideas"], state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const implementationLines = ideas.map(i => {
        if (i.type === "blank-line") {
            return { text: "\n" }
        }
        const lineState = state.makeChild({ context: contextType.blockAllowingReturn, newPreStatementsArray: true })
        const primaryGeneratedLine = fixture.generate(i, lineState)
        const preGeneratedLines = lineState.preStatementGenerators.map(g => resolvePreStatementGenerator(g, state, fixture))
        const allGeneratedLines = [...preGeneratedLines.flat(1), primaryGeneratedLine]
        return allGeneratedLines.map(l => [genIndent(state.indentLevel), l, { text: "\n" }])
    })
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

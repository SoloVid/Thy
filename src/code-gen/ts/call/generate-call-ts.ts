import type { Call } from "../../../tree/call";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromComplicated, fromTokenRange, GeneratedSnippets, GeneratorFixture } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import type { LibraryGeneratorCollection } from "../../library-generator";
import { awaitKeyword, returnKeyword, throwKeyword } from "../block/block-return";
import { generateTypeInstanceTs } from "../generate-type-instance-ts";
import { makeControlFlowCallTsGenerator } from "./generate-control-flow-call-ts";

export function callGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
    return makeCallTsGenerator([
        ...defaultCallTsGenerators,
        standardLibrary.callGenerator,
    ])
}

export const defaultCallTsGenerators = [
    makeControlFlowCallTsGenerator(awaitKeyword),
    makeControlFlowCallTsGenerator(returnKeyword),
    makeControlFlowCallTsGenerator(throwKeyword),
]

export function makeCallTsGenerator(specializations: CodeGeneratorFunc<Call>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "call") {
            return node
        }
    }, generateCallTs, specializations)
}

export function generateCallTs(call: Call, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const functionSnippet = fixture.generate(call.func, state.makeChild({ context: contextType.looseExpression }))
    const typeArgSnippets = call.typeArgs.map((a, i) => {
        const childState = state.makeChild({ context: contextType.isolatedExpression, isTypeContext: true })
        if (i === 0) {
            return generateTypeInstanceTs(a, childState, fixture)
        }
        return [fromTokenRange(call, ", "), generateTypeInstanceTs(a, childState, fixture)]
    })
    const argSnippets = call.args.map((a, i) => {
        const childState = state.makeChild({ context: contextType.isolatedExpression })
        if (i === 0) {
            return fixture.generate(a, childState)
        }
        return [fromTokenRange(call, ", "), fixture.generate(a, childState)]
    })
    return fromComplicated(call, [
        functionSnippet,
        ...(typeArgSnippets.length === 0 ? [] : ["<", typeArgSnippets, ">"]),
        "(", argSnippets, ")"
    ])
}

import type { Call } from "../../../tree/call";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromComplicated, fromTokenRange, GeneratedSnippets, GeneratorFixture } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import { LibraryGeneratorCollection } from "../../library-generator";
import { makeControlFlowCallTsGenerator } from "./generate-control-flow-call-ts";

export function callGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
    return makeCallTsGenerator([
        ...defaultCallTsGenerators,
        standardLibrary.callGenerator,
    ])
}

export const defaultCallTsGenerators = [
    makeControlFlowCallTsGenerator("await"),
    makeControlFlowCallTsGenerator("return"),
    makeControlFlowCallTsGenerator("throw"),
]

export function makeCallTsGenerator(specializations: CodeGeneratorFunc<Call>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "call") {
            return node
        }
    }, generateCallTs, specializations)
}

export function generateCallTs(call: Call, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const functionSnippet = fixture.generate(call.func, state.makeChild({
        context: contextType.looseExpression,
        indentLevel: state.indentLevel + 1
    }))
    const argSnippets = call.args.map((a, i) => {
        const childState = state.makeChild({
            context: contextType.isolatedExpression,
            indentLevel: state.indentLevel + 1
        })
        if (i === 0) {
            return fixture.generate(a, childState)
        }
        return [fromTokenRange(call, ", "), fixture.generate(a, childState)]
    })
    return fromComplicated(call, [
        functionSnippet, "(", argSnippets, ")"
    ])
}

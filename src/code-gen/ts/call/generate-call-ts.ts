import type { Call } from "../../../tree/call";
import type { TreeNode } from "../../../tree/tree-node";
import { tryGenerateDefTs } from "./generate-def-ts";
import { makeGenerator } from "../../generate-from-options";
import { generateTs } from "../generate-ts";
import { CodeGeneratorFunc, fromComplicated, fromTokenRange, GeneratedSnippets } from "../../generator";
import type { GeneratorState } from "../../generator-state";

export const defaultCallTsGenerators = [
    tryGenerateDefTs
]

export const tryGenerateCallTs = makeCallTsGenerator(defaultCallTsGenerators)

export function makeCallTsGenerator(specializations: CodeGeneratorFunc<Call>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "call") {
            return node
        }
    }, generateCallTs, specializations)
}

export function generateCallTs(call: Call, state: GeneratorState): GeneratedSnippets {
    const childState = state.makeChild()
    childState.indentLevel++
    childState.expressionContext = true

    if (call.func.type === 'block') {
        return fromComplicated(call, [
            "(", generateTs(call.func, childState), ")()"
        ])
    }

    const functionSnippet = generateTs(call.func, childState)
    const argSnippets = call.args.map((a, i) => {
        if (i === 0) {
            return generateTs(a, childState)
        }
        return [fromTokenRange(call, ", "), generateTs(a, childState)]
    })
    return fromComplicated(call, [
        functionSnippet, "(", argSnippets, ")"
    ])
}

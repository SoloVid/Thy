import type { Call } from "../../../tree/call";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromComplicated, fromTokenRange, GeneratedSnippets } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import { generateTs } from "../generate-ts";
import { makeControlFlowCallTsGenerator } from "./generate-control-flow-call-ts";
import { tryGenerateIfTs } from "./generate-if-ts";

export const defaultCallTsGenerators = [
    tryGenerateIfTs,
    makeControlFlowCallTsGenerator("await"),
    makeControlFlowCallTsGenerator("return"),
    makeControlFlowCallTsGenerator("throw"),
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
    const functionSnippet = generateTs(call.func, state.makeChild({
        context: contextType.looseExpression,
        indentLevel: state.indentLevel + 1
    }))
    const argSnippets = call.args.map((a, i) => {
        const childState = state.makeChild({
            context: contextType.isolatedExpression,
            indentLevel: state.indentLevel + 1
        })
        if (i === 0) {
            return generateTs(a, childState)
        }
        return [fromTokenRange(call, ", "), generateTs(a, childState)]
    })
    return fromComplicated(call, [
        functionSnippet, "(", argSnippets, ")"
    ])
}

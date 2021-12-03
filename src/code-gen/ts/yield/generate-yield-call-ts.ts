import type { TreeNode } from "../../../tree/tree-node";
import type { YieldCall } from "../../../tree/yield-call";
import { makeGenerator } from "../../generate-from-options";
import { generateTs } from "../generate-ts";
import type { CodeGeneratorFunc, GeneratedSnippets } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";

export const tryGenerateYieldCallTs = makeYieldTsGenerator([

])

export function makeYieldTsGenerator(specializations: CodeGeneratorFunc<YieldCall>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "yield-call") {
            return node
        }
    }, generateYieldCallTs, specializations)
}

export function generateYieldCallTs(yieldCall: YieldCall, state: GeneratorState): GeneratedSnippets {
    // TODO: Actually generate yield logic
    return generateTs(yieldCall.call, state.makeChild({ context: contextType.blockAllowingReturn }))
}

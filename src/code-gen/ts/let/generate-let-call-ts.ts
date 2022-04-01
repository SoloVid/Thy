import type { TreeNode } from "../../../tree/tree-node";
import type { LetCall } from "../../../tree/let-call";
import { makeGenerator } from "../../generate-from-options";
import { generateTs } from "../generate-ts";
import { CodeGeneratorFunc, fromComplicated, GeneratedSnippets } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import type { Call } from "../../../tree/call";
import { tryGenerateIfTs } from "../call/generate-if-ts";
import { makeIndent } from "../../indent-string";
import { standardLibraryGenerators } from "../standard-library";

export const tryGenerateLetCallTs = makeLetTsGenerator([
    trustedCallGenerator(tryGenerateIfTs),
    standardLibraryGenerators.letCallGenerator,
])

export function makeLetTsGenerator(specializations: CodeGeneratorFunc<LetCall>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "let-call") {
            return node
        }
    }, generateLetCallTs, specializations)
}

export function generateLetCallTs(letCall: LetCall, state: GeneratorState): GeneratedSnippets {
    const captureVar = state.getUniqueVariableName()
    const callTs = generateTs(letCall.call, state.makeChild({ context: contextType.isolatedExpression }))
    return fromComplicated(letCall, [
        "const ", captureVar, " = ", callTs, "\n",
        makeIndent(state.indentLevel), "if (", captureVar, " !== undefined) {\n",
        makeIndent(state.indentLevel + 1), "return ", captureVar, "\n",
        makeIndent(state.indentLevel), "}\n",
    ])
}

function trustedCallGenerator(callGenerator: CodeGeneratorFunc<Call>): CodeGeneratorFunc<LetCall> {
    return (letCall, state) => callGenerator(letCall.call, state.makeChild({ context: contextType.blockAllowingReturn }))
}

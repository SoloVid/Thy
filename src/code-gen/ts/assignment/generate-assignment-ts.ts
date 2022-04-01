import { tConstDeclAssign, tVarDeclAssign } from "../../../tokenizer/token-type";
import type { Assignment } from "../../../tree/assignment";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromTokenRange, GeneratedSnippets } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import { generateTs } from "../generate-ts";
import { standardLibraryGenerators } from "../standard-library";
import { tryGenerateDefTs } from "./generate-def-ts";

export const tryGenerateAssignmentTs = makeTryGenerateAssignmentTs([
    tryGenerateDefTs,
    standardLibraryGenerators.assignmentGenerator,
])

export function makeTryGenerateAssignmentTs(specializations: CodeGeneratorFunc<Assignment>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "assignment") {
            return node
        }
    }, generateAssignmentTs, specializations)
}

export function generateAssignmentTs(a: Assignment, state: GeneratorState): GeneratedSnippets {
    const callTs = generateTs(a.call, state.makeChild({ context: contextType.isolatedExpression }))
    return generateAssignmentTs2(a, state, callTs)
}

export function generateAssignmentTs2(a: Assignment, state: GeneratorState, expressionTs: GeneratedSnippets, typeTs?: GeneratedSnippets): GeneratedSnippets {
    const variablePart = generateTs(a.variable, state)
    const variableTypePart = typeTs ? [variablePart, fromTokenRange(a, ": "), typeTs] : [variablePart]
    const assignPart = [variableTypePart, fromTokenRange(a, " = "), expressionTs]
    if (a.operator.type === tConstDeclAssign) {
        return [fromTokenRange(a, "const "), assignPart]
    }
    if (a.operator.type === tVarDeclAssign) {
        return [fromTokenRange(a, "let "), assignPart]
    }
    return assignPart
}

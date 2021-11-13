import { tConstDeclAssign, tVarDeclAssign } from "../../tokenizer/token-type";
import type { Assignment } from "../../tree/assignment";
import type { TreeNode } from "../../tree/tree-node";
import { makeGenerator } from "../generate-from-options";
import { CodeGeneratorFunc, fromTokenRange, GeneratedSnippets } from "../generator";
import type { GeneratorState } from "../generator-state";
import { generateTs } from "./generate-ts";

export const tryGenerateAssignmentTs = makeTryGenerateAssignmentTs([
    
])

export function makeTryGenerateAssignmentTs(specializations: CodeGeneratorFunc<Assignment>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "assignment") {
            return node
        }
    }, generateAssignmentTs, specializations)
}

export function generateAssignmentTs(a: Assignment, state: GeneratorState): GeneratedSnippets {
    const callTs = generateTs(a.call, state)
    const variablePart = generateTs(a.variable, state)
    const assignPart = [variablePart, fromTokenRange(a, " = "), callTs]
    if (a.operator.type === tConstDeclAssign) {
        return [fromTokenRange(a, "const "), assignPart]
    }
    if (a.operator.type === tVarDeclAssign) {
        return [fromTokenRange(a, "let "), assignPart]
    }
    return assignPart
}

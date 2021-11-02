import { tConstDeclAssign, tVarDeclAssign } from "../tokenizer/token-type";
import type { Assignment } from "../tree/assignment";
import type { TreeNode } from "../tree/tree-node";
import { generateTs } from "./generate-ts";
import type { GeneratorState } from "./generator-state";

export function tryGenerateAssignmentTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "assignment") {
        return generateAssignmentTs(node, state)
    }
}

export function generateAssignmentTs(a: Assignment, state: GeneratorState): string {
    const callTs = generateTs(a.call, state)
    const variablePart = generateTs(a.variable)
    const assignPart = `${variablePart} = ${callTs}`
    if (a.operator.type === tConstDeclAssign) {
        return `const ${assignPart}`
    }
    if (a.operator.type === tVarDeclAssign) {
        return `let ${assignPart}`
    }
    return assignPart
}

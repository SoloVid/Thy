import { tBe, tIs } from "../tokenizer/token-type";
import { Assignment } from "../tree/assignment";
import { Call } from "../tree/call";
import { TreeNode } from "../tree/tree-node";
import { generateTs } from "./generate-ts";
import { GeneratorState } from "./generator-state";

export function tryGenerateAssignmentTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "assignment") {
        return generateAssignmentTs(node, state)
    }
}

export function generateAssignmentTs(a: Assignment, state: GeneratorState): string {
    const callTs = generateTs(a.call, state)
    const assignPart = `${a.variable.text} = ${callTs}`
    if (a.operator.type === tIs) {
        return `const ${assignPart}`
    }
    if (a.operator.type === tBe) {
        return `let ${assignPart}`
    }
    return assignPart
}

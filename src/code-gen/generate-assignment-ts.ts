import { tVarDeclAssign, tConstDeclAssign } from "../tokenizer/token-type";
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
    const variablePart = generateTs(a.variable)
    const assignPart = `${variablePart} = ${callTs}`
    // TODO: Somewhere we need to handle the ghosting problem (error)
    if (a.operator.type === tConstDeclAssign) {
        // state.localVariables.push({
        //     token: a.variable,
        //     name: variableName,
        //     isConstant: true
        // })
        return `const ${assignPart}`
    }
    if (a.operator.type === tVarDeclAssign) {
        // state.localVariables.push({
        //     token: a.variable,
        //     name: variableName,
        //     isConstant: false
        // })
        return `let ${assignPart}`
    }
    return assignPart
}

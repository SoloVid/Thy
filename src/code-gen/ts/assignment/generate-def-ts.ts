import { tokenError } from "../../../compile-error";
import type { Assignment } from "../../../tree/assignment";
import { nodeError } from "../../../tree/tree-node";
import { fromTokenRange, GeneratedSnippets } from "../../generator";
import type { GeneratorState } from "../../generator-state";
import { generateTs } from "../generate-ts";
import { generateAssignmentTs2 } from "./generate-assignment-ts";

export const defName = "def"

export function tryGenerateDefTs(node: Assignment, state: GeneratorState): void | GeneratedSnippets {
    if (node.call.func.type !== "identifier") {
        return
    }
    if (node.call.func.target.text !== defName) {
        return
    }

    for (const scope of node.call.func.scopes) {
        state.addError(nodeError(scope, `def cannot be scoped`))
    }

    if (node.call.args.length === 0) {
        state.addError(tokenError(node.call.func.target, "def requires 1 argument"))
        return fromTokenRange(node, "undefined")
    }

    for (const arg of node.call.typeArgs.slice(1)) {
        state.addError(nodeError(arg, `def cannot take more than 1 type argument`))
    }
    for (const arg of node.call.args.slice(1)) {
        state.addError(nodeError(arg, `def cannot take more than 1 argument`))
    }

    const childState = state.makeChild()
    childState.indentLevel++

    const expressionTs = generateTs(node.call.args[0], childState)
    return generateAssignmentTs2(node, state, expressionTs, node.call.typeArgs.length === 1 ? generateTs(node.call.typeArgs[0], childState) : undefined)
}

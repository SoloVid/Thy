import { nodeError } from "../../../../tree/tree-node";
import { fromTokenRange } from "../../../generator";
import type { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { generateAssignmentTs2 } from "../../assignment/generate-assignment-ts";
import { generateTypeInstanceTs } from "../../generate-type-instance-ts";
import { autoTightS } from "../helpers/auto-tight";

export const defGenerator: GeneratorForGlobalSpec = {
    name: "def",
    generateValue(state) {
        return autoTightS(state, "<_T>(input: unknown) => (input as T)")
    },
    generateAssignment(node, state, fixture) {
        if (node.call.args.length === 0) {
            state.addError(nodeError(node.call.func, "def requires 1 argument"))
            return fromTokenRange(node, "undefined")
        }
    
        for (const arg of node.call.typeArgs.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 type argument`))
        }
        for (const arg of node.call.args.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 argument`))
        }
    
        const childState = state.makeChild()
        const expressionTs = fixture.generate(node.call.args[0], childState)
        return generateAssignmentTs2(node, state, fixture, expressionTs, node.call.typeArgs.length === 1 ? fixture.generate(node.call.typeArgs[0], childState) : undefined)
    },
    generateSimpleTypeCall(node, state, fixture) {
        if (node.args.length === 0) {
            state.addError(nodeError(node.func, "def requires 1 argument"))
            return fromTokenRange(node, "undefined")
        }

        for (const arg of node.args.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 argument`))
        }

        return generateTypeInstanceTs(node.args[0], state, fixture)
    }
}
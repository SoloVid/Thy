import { tokenError } from "../../../../compile-error";
import { nodeError } from "../../../../tree/tree-node";
import { fromComplicated, fromTokenRange } from "../../../generator";
import { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { autoTight, autoTightS } from "../helpers/auto-tight";

export const castGenerator: GeneratorForGlobalSpec = {
    name: 'cast',
    generateValue(state) {
        return autoTightS(state, '<_T>(_value: unknown) => (_value as _T)')
    },
    generateCall(node, state, fixture) {
        if (node.typeArgs.length < 1) {
            state.addError(tokenError(node.func.target, `cast requires 1 type argument`));
        }
        for (const arg of node.typeArgs.slice(1)) {
            state.addError(nodeError(arg, `cast cannot take more than 1 type argument`))
        }
        if (node.args.length < 1) {
            state.addError(tokenError(node.func.target, `cast requires 1 argument`));
            return fromTokenRange(node, 'null');
        }
        for (const arg of node.args.slice(1)) {
            state.addError(nodeError(arg, `cast cannot take more than 1 argument`))
        }
        const childState = state.makeChild()
        return fromComplicated(node, autoTight(state, [
            fixture.generate(node.args[0], childState),
            "as unknown as ",
            fixture.generate(node.typeArgs[0], childState)
        ]))
    }
}
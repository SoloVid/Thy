import { tokenError } from "../../../../compile-error";
import { fromComplicated } from "../../../generator";
import { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { contextType } from "../../../generator-state";
import { autoTight, autoTightS } from "./auto-tight";

export function makeBinaryNumberFunctionGenerator(name: string, jsOperator: string): GeneratorForGlobalSpec {
    return {
        name: name,
        generateValue(state) {
            return autoTightS(state, `(_a: number, _b: number) => _a ${jsOperator} _b`);
        },
        generateCall(node, state, fixture) {
            if (node.args.length < 2) {
                state.addError(tokenError(node.func.target, `${name} requires two arguments`));
                return fromComplicated(node, ["0"]);
            }
            const childState = state.makeChild({ context: contextType.isolatedExpression });
            return fromComplicated(node, autoTight(state, [
                fixture.generate(node.args[0], childState),
                ` ${jsOperator} `,
                fixture.generate(node.args[1], childState),
            ]));
        }
    };
}

import { tokenError } from "../../../../compile-error";
import { fromComplicated } from "../../../generator";
import { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { contextType } from "../../../generator-state";
import { generateTs } from "../../generate-ts";
import { autoTight, autoTightS } from "./auto-tight";

export function makeBinaryNumberFunctionGenerator(name: string, jsOperator: string): GeneratorForGlobalSpec {
    return {
        name: name,
        generateValue(state) {
            return autoTightS(state, `(_a: number, _b: number) => _a ${jsOperator} _b`);
        },
        generateCall(node, state) {
            if (node.args.length < 2) {
                state.addError(tokenError(node.func.target, `${name} requires two arguments`));
                return fromComplicated(node, ["0"]);
            }
            const childState = state.makeChild({ context: contextType.isolatedExpression });
            return fromComplicated(node, autoTight(state, [
                generateTs(node.args[0], childState),
                ` ${jsOperator} `,
                generateTs(node.args[1], childState),
            ]));
        }
    };
}

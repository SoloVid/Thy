import { tokenError } from "../../../compile-error";
import { fromComplicated } from "../../generator";
import type { GeneratorForGlobalParentSpec, GeneratorForGlobalSpec } from "../../generator-for-global";
import { contextType } from "../../generator-state";
import { autoTight, autoTightS } from "./helpers/auto-tight";
import { makeLogicalFunctionGenerator, makeSequencedLogicalFunctionGenerator } from "./helpers/logical-function-generator";

const all = makeLogicalFunctionGenerator('all', '&&', 'true')
const asc = makeSequencedLogicalFunctionGenerator('asc', '<', 'number', ' + 1')
const desc = makeSequencedLogicalFunctionGenerator('desc', '>', 'number', ' - 1')
const equal = makeSequencedLogicalFunctionGenerator('equal', '===', 'unknown', '')
const not: GeneratorForGlobalSpec = {
    name: 'not',
    generateValue(state) {
        return autoTightS(state, `(_a: boolean) => !_a`);
    },
    generateCall(node, state, fixture) {
        if (node.args.length !== 1) {
            state.addError(tokenError(node.func.target, `not takes exactly 1 argument`));
            return fromComplicated(node, ["false"]);
        }
        const childState = state.makeChild({ context: contextType.isolatedExpression });
        return fromComplicated(node, autoTight(state, ["!", fixture.generate(node.args[0], childState)]));
    }
}
const some = makeLogicalFunctionGenerator('some', '||', 'false')

export const checkGenerator: GeneratorForGlobalParentSpec = {
    name: "check",
    children: [
        all,
        asc,
        desc,
        equal,
        not,
        some,
    ],
}



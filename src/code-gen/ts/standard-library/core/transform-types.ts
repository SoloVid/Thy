import type { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { autoTightS } from "../helpers/auto-tight";

export const unionGenerator: GeneratorForGlobalSpec = {
    name: 'Union',
    generateValue(state) {
        return autoTightS(state, '<_A, _B>(_a: _A, _b: _B) => (undefined as unknown as _A | _B)')
    }
}
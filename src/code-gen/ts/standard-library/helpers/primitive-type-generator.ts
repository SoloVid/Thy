import type { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { autoTightS } from "./auto-tight";

export function makePrimitiveTypeGenerator(name: string, tsType: string): GeneratorForGlobalSpec {
    return {
        name: name,
        generateValue(state) {
            return autoTightS(state, `undefined as unknown as ${tsType}`)
        },
        generateTypeInstance(state) {
            return tsType
        }
    };
}

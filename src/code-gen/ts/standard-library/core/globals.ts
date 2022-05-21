import type { GeneratorForGlobalSpec } from "../../../generator-for-global";

function simpleGlobalGenerator(name: string): GeneratorForGlobalSpec {
    return {
        name: name,
        generateValue: () => name,
    }
}

export const consoleGenerator = simpleGlobalGenerator("console")
export const falseGenerator = simpleGlobalGenerator("false")
export const nullGenerator = simpleGlobalGenerator("null")
export const trueGenerator = simpleGlobalGenerator("true")

export const catchGenerator = simpleGlobalGenerator("\"catch\"")
export const elseGenerator = simpleGlobalGenerator("\"else\"")
export const finallyGenerator = simpleGlobalGenerator("\"finally\"")

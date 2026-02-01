import type { GeneratorForNameSpec } from "../../generator-for-name.ts"

function simpleGlobalGenerator(
  name: string,
  tsValue: string = name,
): GeneratorForNameSpec {
  return {
    name: name,
    generateValue: () => tsValue,
    generateTypeInstance: () => tsValue,
  }
}

export const falseGenerator = simpleGlobalGenerator("false")
export const nullGenerator = simpleGlobalGenerator("null")
export const trueGenerator = simpleGlobalGenerator("true")

export const catchGenerator = simpleGlobalGenerator("catch", '"catch"')
export const elseGenerator = simpleGlobalGenerator("else", '"else"')
export const finallyGenerator = simpleGlobalGenerator("finally", '"finally"')

import type { GeneratorForNameSpec } from "../../generator-for-name.ts"

export function makePrimitiveTypeGenerator(
  name: string,
  tsType: string,
): GeneratorForNameSpec {
  return {
    name: name,
    generateTypeInstance() {
      return tsType
    },
  }
}

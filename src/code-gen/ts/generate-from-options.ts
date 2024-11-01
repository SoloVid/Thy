import type { TreeNode } from "tree"
import type { GeneratorState } from "./generator-state"
import type { CodeGeneratorFunc, CodeGeneratorFuncNoFixture, DefiniteCodeGeneratorFunc, DefiniteCodeGeneratorFuncNoFixture, GeneratorFixture } from "./ts-generator"

export function makeGenerator<InType extends TreeNode, SpecializedType>(
  transformNode: (node: InType) => SpecializedType | void,
  generateDefault: DefiniteCodeGeneratorFunc<SpecializedType>,
  specializations: CodeGeneratorFunc<SpecializedType>[],
): CodeGeneratorFunc<InType> {
  return (node, state, fixture) => {
    const specializedNode = transformNode(node)
    if (specializedNode === undefined) {
      return
    }

    const specializedOutput = tryGeneratorOptions(specializedNode, state, fixture, specializations)
    if (specializedOutput !== undefined) {
      return specializedOutput
    }

    return generateDefault(specializedNode, state, fixture)
  }
}

export function makeGeneratorWithFixtureSideCar<InType extends TreeNode, SpecializedType>(
  getFixture: () => GeneratorFixture,
  transformNode: (node: InType) => SpecializedType,
  generateDefault: DefiniteCodeGeneratorFunc<SpecializedType>,
  specializations: CodeGeneratorFunc<SpecializedType>[],
): DefiniteCodeGeneratorFuncNoFixture<InType> {
  return (node, state) => {
    const specializedNode = transformNode(node)

    const specializedOutput = tryGeneratorOptions(specializedNode, state, getFixture(), specializations)
    if (specializedOutput !== undefined) {
      return specializedOutput
    }

    return generateDefault(specializedNode, state, getFixture())
  }
}

export function tryGeneratorOptions<T>(
  node: T,
  state: GeneratorState,
  fixture: GeneratorFixture,
  specializations: CodeGeneratorFunc<T>[],
) {
  for (const generator of specializations) {
    const outputCode = generator(node, state, fixture)
    if (outputCode !== undefined) {
      return outputCode
    }
  }
}

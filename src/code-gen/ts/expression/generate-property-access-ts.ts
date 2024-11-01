import { fromToken } from "code-gen/utils/from-token"
import type { TreeNode, TypePropertyAccess, ValuePropertyAccess } from "tree"
import type {
  GeneratedSnippets,
} from "../../generator"
import { makeGenerator } from "../generate-from-options"
import type { GeneratorState } from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator"

export function valuePropertyAccessGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeValuePropertyAccessTsGenerator([
    standardLibrary.propertyAccessGenerator,
  ])
}

export function makeValuePropertyAccessTsGenerator(
  specializations: CodeGeneratorFunc<ValuePropertyAccess>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "value-property-access") {
        return node
      }
    },
    generatePropertyAccessTs,
    specializations,
  )
}

export function typePropertyAccessGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypePropertyAccessTsGenerator([
    standardLibrary.typePropertyAccessGenerator,
  ])
}

export function makeTypePropertyAccessTsGenerator(
  specializations: CodeGeneratorFunc<TypePropertyAccess>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "type-property-access") {
        return node
      }
    },
    generatePropertyAccessTs,
    specializations,
  )
}

export function generatePropertyAccessTs(
  node: ValuePropertyAccess | TypePropertyAccess,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  return [fixture.generate(node.base, state), generatePropertyAccessesTailTs(node)]
}

export function generatePropertyAccessesTailTs(
  node: ValuePropertyAccess | TypePropertyAccess,
) {
  return node.propertyAccesses
  .map((pa) => [fromToken(pa.memberAccessOperatorToken, "."), fromToken(pa.propertyToken)])
  .flat()
}

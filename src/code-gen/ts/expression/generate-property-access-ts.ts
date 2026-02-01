import { fromToken } from "code-gen/utils/from-token.ts"
import type { TreeNode, TypePropertyAccess, ValuePropertyAccess } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import { makeGenerator } from "../generate-from-options.ts"
import type { GeneratorState } from "../generator-state.ts"
import type { LibraryGeneratorCollection } from "../library-generator.ts"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator.ts"

export function valuePropertyAccessGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeValuePropertyAccessTsGenerator([
    standardLibrary.valueIdentifierGenerator,
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
  return makeTypePropertyAccessTsGenerator([])
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
  return [
    fixture.generate(node.base, state),
    generatePropertyAccessesTailTs(node),
  ]
}

export function generatePropertyAccessesTailTs(
  node: ValuePropertyAccess | TypePropertyAccess,
) {
  return node.propertyAccesses
    .map((pa) => [
      fromToken(pa.memberAccessOperatorToken, "."),
      fromToken(pa.propertyToken),
    ])
    .flat()
}

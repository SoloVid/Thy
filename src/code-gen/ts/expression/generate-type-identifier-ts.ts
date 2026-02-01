import type { TreeNode, TypeIdentifier } from "tree"
import { makeGenerator, tryGeneratorOptions } from "../generate-from-options.ts"
import type { LibraryGeneratorCollection } from "../library-generator.ts"
import type { CodeGeneratorFunc } from "../ts-generator.ts"
import { generateIdentifierTs } from "./generate-value-identifier-ts.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import { autoTightC } from "../utils/auto-tight.ts"

export function typeIdentifierGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypeIdentifierTsGenerator([
    (node, state, fixture) => {
      const typeSnippets = standardLibrary.typeIdentifierGenerator(
        node,
        state,
        fixture,
      )
      if (typeSnippets) {
        return autoTightC(state, node, [
          fromNode(node, "undefined as unknown as "),
          typeSnippets,
        ])
      }
    },
  ])
}

export function makeTypeIdentifierTsGenerator(
  specializations: CodeGeneratorFunc<TypeIdentifier>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "type-identifier") {
        return node
      }
    },
    generateIdentifierTs,
    specializations,
  )
}

export function typeIdentifierGeneratorTypeTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypeIdentifierTypeTsGenerator([
    standardLibrary.typeIdentifierGenerator,
  ])
}

export function makeTypeIdentifierTypeTsGenerator(
  specializations: CodeGeneratorFunc<TypeIdentifier>[],
): CodeGeneratorFunc<TreeNode> {
  return (node, state, fixture) => {
    if (node.type !== "type-identifier") {
      return
    }

    return tryGeneratorOptions(node, state, fixture, specializations)
  }
}

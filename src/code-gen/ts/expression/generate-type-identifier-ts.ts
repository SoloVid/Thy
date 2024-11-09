import type { TreeNode, TypeIdentifier } from "tree"
import { makeGenerator, tryGeneratorOptions } from "../generate-from-options"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc } from "../ts-generator"
import { generateIdentifierTs } from "./generate-value-identifier-ts"
import { fromNode } from "code-gen/utils/from-node"
import { autoTightC } from "../utils/auto-tight"

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

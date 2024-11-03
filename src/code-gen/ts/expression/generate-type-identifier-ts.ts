import type { TreeNode, TypeIdentifier } from "tree"
import { makeGenerator, tryGeneratorOptions } from "../generate-from-options"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc } from "../ts-generator"
import { generateIdentifierTs } from "./generate-value-identifier-ts"

export function typeIdentifierGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypeIdentifierTsGenerator([])
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

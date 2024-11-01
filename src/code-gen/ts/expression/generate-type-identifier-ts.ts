import type { CodeGeneratorFunc } from "code-gen/ts/ts-generator"
import type { TreeNode, ValueIdentifier } from "tree"
import { makeGenerator } from "../generate-from-options"
import type { LibraryGeneratorCollection } from "../library-generator"
import { generateIdentifierTs } from "./generate-value-identifier-ts"

export function typeIdentifierGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypeIdentifierTsGenerator([
    standardLibrary.typeInstanceGenerator,
  ])
}

export function makeTypeIdentifierTsGenerator(
  specializations: CodeGeneratorFunc<ValueIdentifier>[],
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

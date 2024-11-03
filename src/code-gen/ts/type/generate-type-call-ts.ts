import type { TreeNode, TypeCall } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { generateCallTsInTypeContext } from "../call/generate-call-ts"
import { makeGenerator, tryGeneratorOptions } from "../generate-from-options"
import type { GeneratorState } from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator"
import { tryGenerateTypeGivenCallTs } from "./generate-type-given-call-ts"

export function typeCallGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypeCallTsGenerator([...defaultTypeCallTsGenerators])
}

export const defaultTypeCallTsGenerators = [tryGenerateTypeGivenCallTs]

export function makeTypeCallTsGenerator(
  specializations: CodeGeneratorFunc<TypeCall>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "type-call") {
        return node
      }
    },
    generateTypeCallTs,
    specializations,
  )
}

export function generateTypeCallTs(
  node: TypeCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
  callName?: string,
): GeneratedSnippets {
  return generateCallTsInTypeContext(node, state, fixture, callName)
}

export function typeCallGeneratorTypeTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypeCallTypeTsGenerator([standardLibrary.typeCallGenerator])
}

export function makeTypeCallTypeTsGenerator(
  specializations: CodeGeneratorFunc<TypeCall>[],
): CodeGeneratorFunc<TreeNode> {
  return (node, state, fixture) => {
    if (node.type !== "type-call") {
      return
    }

    return tryGeneratorOptions(node, state, fixture, specializations)
  }
}

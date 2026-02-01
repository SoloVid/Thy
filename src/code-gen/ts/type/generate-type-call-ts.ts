import type { TreeNode, TypeCall } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import { generateCallTsInTypeContext } from "../call/generate-call-ts.ts"
import { makeGenerator, tryGeneratorOptions } from "../generate-from-options.ts"
import type { GeneratorState } from "../generator-state.ts"
import type { LibraryGeneratorCollection } from "../library-generator.ts"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator.ts"
import { tryGenerateTypeGivenCallTs } from "./generate-type-given-call-ts.ts"

export function typeCallGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTypeCallTsGenerator([])
}

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

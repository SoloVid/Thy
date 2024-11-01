import type { TreeNode, TypeCall } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { generateCallTsInTypeContext } from "../call/generate-call-ts"
import { makeGenerator } from "../generate-from-options"
import type { GeneratorState } from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator"
import { tryGenerateTypeGivenCallTs } from "./generate-type-given-call-ts"

export function typeCallGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
  return makeTypeCallTsGenerator([
    ...defaultTypeCallTsGenerators,
    standardLibrary.callGenerator,
  ])
}

export const defaultTypeCallTsGenerators = [
  tryGenerateTypeGivenCallTs,
]

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
  const fromStandardLib = fixture.standardLibrary.typeCallGenerator(
    node,
    state,
    fixture,
  )
  if (fromStandardLib !== undefined) {
    return fromStandardLib
  }
  return generateCallTsInTypeContext(
    node,
    state,
    fixture,
    callName,
  )
}

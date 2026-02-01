import { fromNode } from "code-gen/utils/from-node.ts"
import { nodeError } from "common/compile-error.ts"
import type { TreeNode, TypeIdentifier, ValueIdentifier } from "tree"
import type { ThyTerm } from "tree/term.ts"
import type { GeneratedSnippets } from "../../generator.ts"
import { makeGenerator } from "../generate-from-options.ts"
import type { GeneratorState } from "../generator-state.ts"
import type { LibraryGeneratorCollection } from "../library-generator.ts"
import type { CodeGeneratorFunc } from "../ts-generator.ts"
import { trace } from "../utils/debug.ts"

export type SpecialValueIdentifier = ThyTerm

export function valueIdentifierGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeValueIdentifierTsGenerator([
    standardLibrary.valueIdentifierGenerator,
  ])
}

export function makeValueIdentifierTsGenerator(
  specializations: CodeGeneratorFunc<
    ValueIdentifier | SpecialValueIdentifier
  >[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "value-identifier" || node.type === "thy-term") {
        return node
      }
    },
    generateIdentifierTs,
    specializations,
  )
}

export function generateIdentifierTs(
  node: ValueIdentifier | SpecialValueIdentifier | TypeIdentifier,
  state: GeneratorState,
): GeneratedSnippets {
  trace(`generateIdentifierTs(${node.token.text})`)
  const identifierName = node.token.text
  if (
    state.symbolTable === null ||
    state.symbolTable.getSymbolInfo(identifierName) === null
  ) {
    if (!state.implicitArguments) {
      state.addError(
        nodeError(
          node,
          `${identifierName} is not defined locally and there is no target for implicit arguments in this scope`,
        ),
      )
    } else {
      state.implicitArguments.markImplicitArgumentUsed()
      return fromNode(
        node,
        `${state.implicitArguments.variableName}.${identifierName}`,
      )
    }
  }
  return fromNode(node, identifierName)
}

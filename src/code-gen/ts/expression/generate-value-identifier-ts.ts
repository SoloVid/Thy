import { fromNode } from "code-gen/utils/from-node"
import { nodeError } from "common/compile-error"
import type { TreeNode, TypeIdentifier, ValueIdentifier } from "tree"
import type { ThyTerm } from "tree/term"
import type { GeneratedSnippets } from "../../generator"
import { makeGenerator } from "../generate-from-options"
import type { GeneratorState } from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc } from "../ts-generator"
import { trace } from "../utils/debug"

export type SpecialValueIdentifier = ThyTerm

export function valueIdentifierGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeValueIdentifierTsGenerator([
    standardLibrary.valueIdentifierGenerator,
  ])
}

export function makeValueIdentifierTsGenerator(
  specializations: CodeGeneratorFunc<ValueIdentifier | SpecialValueIdentifier>[],
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

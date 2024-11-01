import type { CodeGeneratorFunc } from "code-gen/ts/ts-generator"
import { fromToken } from "code-gen/utils/from-token"
import { nodeError } from "common/compile-error"
import type { TreeNode, TypeIdentifier, ValueIdentifier } from "tree"
import assert from "utils/assert"
import { makeGenerator } from "../generate-from-options"
import type { GeneratedSnippets } from "../../generator"
import type { GeneratorState } from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"
import { ErrorableTreeNode } from "parser/error"
import { fromNode } from "code-gen/utils/from-node"

export function valueIdentifierGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeValueIdentifierTsGenerator([
    standardLibrary.valueIdentifierGenerator,
  ])
}

export function makeValueIdentifierTsGenerator(
  specializations: CodeGeneratorFunc<ValueIdentifier>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "value-identifier") {
        return node
      }
    },
    generateIdentifierTs,
    specializations,
  )
}

export function generateIdentifierTs(
  node: ValueIdentifier | TypeIdentifier,
  state: GeneratorState,
): GeneratedSnippets {
  const identifierName = node.token.text
  assert(
    state.block !== null,
    "generateIdentifierTs() should always be called in context of a block",
  )
  if (state.block.symbolTable.getSymbolInfo(identifierName) === null) {
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

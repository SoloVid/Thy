import { nodeError } from "common/compile-error"
import type { TreeNode, ValueIdentifier } from "tree"
import assert from "utils/assert"
import { makeGenerator } from "../../generate-from-options"
import { CodeGeneratorFunc, GeneratedSnippets } from "../../generator"
import { fromToken } from "code-gen/utils/from-token"
import type { GeneratorState } from "../../generator-state"
import type { LibraryGeneratorCollection } from "../../library-generator"

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
    generateValueIdentifierTs,
    specializations,
  )
}

export function generateValueIdentifierTs(
  value: ValueIdentifier,
  state: GeneratorState,
): GeneratedSnippets {
  assert(
    state.block !== null,
    "generateValueIdentifierTs() should always be called in context of a block",
  )
  if (state.block.symbolTable.getSymbolInfo(value.token.text) === null) {
    if (!state.implicitArguments) {
      state.addError(
        nodeError(
          value,
          `${value.token.text} is not defined locally and there is no target for implicit arguments in this scope`,
        ),
      )
    } else {
      state.implicitArguments.markImplicitArgumentUsed()
      return fromToken(
        value.token,
        `${state.implicitArguments.variableName}.${value.token.text}`,
      )
    }
  }
  return fromToken(value.token, value.token.text)
}

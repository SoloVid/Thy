import { CodeGeneratorFunc, GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import type { LetCall } from "../../../tree/let-call"
import type { TreeNode } from "../../../tree/tree-node"
import { makeGenerator } from "../generate-from-options"
import type { GeneratedSnippets } from "../../generator"
import { makeIndent } from "../../utils/indent"
import { GeneratorState } from "../generator-state"
import { contextType } from "../generator-context"
import type { LibraryGeneratorCollection } from "../library-generator"

export function letCallGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeLetTsGenerator([standardLibrary.letCallGenerator])
}

export function makeLetTsGenerator(
  specializations: CodeGeneratorFunc<LetCall>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "let-call") {
        return node
      }
    },
    generateLetCallTs,
    specializations,
  )
}

export function generateLetCallTs(
  letCall: LetCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  if (letCall.call === null) {
    return []
  }
  const captureVar = state.getUniqueVariableName()
  const callTs = fixture.generate(
    letCall.call,
    state.makeChild({ context: contextType.isolatedExpression }),
  )
  return fromComplicated(letCall, [
    "const ",
    captureVar,
    " = ",
    callTs,
    "\n",
    makeIndent(state.indentLevel),
    "if (",
    captureVar,
    " !== undefined) {\n",
    makeIndent(state.indentLevel + 1),
    "return ",
    captureVar,
    "\n",
    makeIndent(state.indentLevel),
    "}\n",
  ])
}

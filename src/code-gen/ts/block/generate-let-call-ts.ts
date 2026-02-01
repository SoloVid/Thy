import { CodeGeneratorFunc, GeneratorFixture } from "code-gen/ts/ts-generator.ts"
import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import type { LetCall } from "../../../tree/let-call.ts"
import type { TreeNode } from "../../../tree/tree-node.ts"
import { makeGenerator } from "../generate-from-options.ts"
import type { GeneratedSnippets } from "../../generator.ts"
import { makeIndent } from "../../utils/indent.ts"
import { GeneratorState } from "../generator-state.ts"
import { contextType } from "../generator-context.ts"
import type { LibraryGeneratorCollection } from "../library-generator.ts"
import { fromNode } from "code-gen/utils/from-node.ts"

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

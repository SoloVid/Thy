import { fromComplicated } from "code-gen/utils/from-complicated"
import type { TreeNode, TypeAssignment } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { makeGenerator } from "../generate-from-options"
import { GeneratorState } from "../generator-state"
import { contextType } from "../generator-context"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator"

export function typeAssignmentGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTryGenerateAssignmentTs([standardLibrary.typeAssignmentGenerator])
}

export function makeTryGenerateAssignmentTs(
  specializations: CodeGeneratorFunc<TypeAssignment>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "type-assignment") {
        return node
      }
    },
    generateTypeAssignmentTs,
    specializations,
  )
}

export function generateTypeAssignmentTs(
  ta: TypeAssignment,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const name = ta.variable.token.text
  const childState = state.makeChild({
    context: contextType.looseExpression,
    isTypeContext: true,
  })
  return fromComplicated(ta, [
    `const ${name} = undefined as unknown as `,
    fixture.generateAsType(ta.call, childState),
  ])
}

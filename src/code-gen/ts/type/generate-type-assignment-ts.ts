import { fromComplicated } from "code-gen/utils/from-complicated"
import type { TreeNode, TypeAssignment } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { makeGenerator } from "../generate-from-options"
import { GeneratorState } from "../generator-state"
import { contextType } from "../generator-context"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator"
import { trace } from "../utils/debug"
import { generateTypeGivenCallTypeTsWithParameterName } from "./generate-type-given-call-ts"

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
  trace(`generateTypeAssignmentTs()`)

  const name = ta.variable.token.text

  function generateValueExpression() {
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
      isTypeContext: true,
      assignmentContextName: name,
    })
    if (ta.call.type === "type-given-call") {
      return generateTypeGivenCallTypeTsWithParameterName(
        ta.call,
        childState,
        fixture,
        `_${ta.variable.token.text}`,
      )
    }
    return fixture.generateAsType(ta.call, childState)
  }

  return fromComplicated(ta, [
    `const ${name} = undefined as unknown as `,
    generateValueExpression(),
  ])
}

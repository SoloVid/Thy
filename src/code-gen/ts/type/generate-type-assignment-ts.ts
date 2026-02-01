import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import type { TreeNode, TypeAssignment } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import { makeGenerator } from "../generate-from-options.ts"
import { GeneratorState } from "../generator-state.ts"
import { contextType } from "../generator-context.ts"
import type { LibraryGeneratorCollection } from "../library-generator.ts"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator.ts"
import { trace } from "../utils/debug.ts"
import { generateTypeGivenCallTypeTsWithParameterName } from "./generate-type-given-call-ts.ts"

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

import { fromComplicated } from "code-gen/utils/from-complicated"
import type { Call, TreeNode, TypeAssignment, TypeCall, TypeGivenCall } from "tree"
import type {
  GeneratedSnippets,
} from "../../generator"
import { generateValueCallTs } from "../call/generate-call-ts"
import { contextType, GeneratorState } from "../generator-state"
import type { GeneratorFixture } from "../ts-generator"
import { generateTypeCallTs } from "./generate-type-call-ts"

export function tryGenerateTypeAssignmentTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "type-assignment") {
    return generateTypeAssignmentTs(node, state, fixture)
  }
}

export function generateTypeAssignmentTs(
  ta: TypeAssignment,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const stdLibGenerated = fixture.standardLibrary.typeAssignmentGenerator(
    ta,
    state,
    fixture,
  )
  if (stdLibGenerated) {
    return stdLibGenerated
  }

  const name = ta.variable.token.text
  const childState = state.makeChild({
    context: contextType.isolatedExpression,
    isTypeContext: true,
  })
  return fromComplicated(ta, [
    `const ${name} = undefined as unknown as `,
    fixture.generateAsType(ta.call, childState),
  ])
}

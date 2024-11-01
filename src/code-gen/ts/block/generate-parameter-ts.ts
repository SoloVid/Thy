import { type TreeNode, isAssignment } from "tree"
import {
  GeneratedSnippets,
  GeneratorFixture,
} from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromToken } from "code-gen/utils/from-token"
import { GeneratorState, contextType } from "../../generator-state"
import { generateTypeInstanceTs } from "../type/generate-type-instance-ts"
import { generatePreStatementAndTypeForParam } from "./generatePreStatementAndTypeForParam"
import type { PreludeTypeInfo } from "./prelude-type-info"

export function generateParameterTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
  preludeTypeInfo: PreludeTypeInfo,
): GeneratedSnippets | null {
  // TODO: Also support `given` call without assignment (ignored parameter)
  // TODO: Decide and implement support for non-constant assignments
  if (!isAssignment(node)) {
    return null
  }
  if (node.call.type !== "given-call") {
    return null
  }
  // TODO: Support property access here
  if (node.variable.type !== "atom") {
    return null
  }

  const typeInstanceSnippet =
    preludeTypeInfo.typeSnippets.length === 0
      ? generateTypeInstanceTs(node.call.typeArgs[0], state, fixture)
      : generatePreStatementAndTypeForParam(
          node.call,
          state,
          fixture,
          preludeTypeInfo,
          node.variable.token.text,
        )
  const typeSnippet =
    node.call.typeArgs.length === 0 ? [] : [": ", typeInstanceSnippet]
  const defaultValueSnippet =
    node.call.args.length === 0
      ? []
      : [
          " = ",
          fixture.generate(
            node.call.args[0],
            state.makeChild({ context: contextType.isolatedExpression }),
          ),
        ]
  return fromComplicated(node, [
    fromToken(node.variable.token),
    ...typeSnippet,
    ...defaultValueSnippet,
  ])
}

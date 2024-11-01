import type { TreeNode } from "tree"
import {
  GeneratedSnippets,
  GeneratorFixture,
} from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import type { GeneratorState } from "../../generator-state"
import { checkAndGenerateTypeInstanceTs } from "../type/generate-type-instance-ts"
import { generatePreStatementAndTypeForParam } from "./generatePreStatementAndTypeForParam"
import type { PreludeTypeInfo } from "./prelude-type-info"

export function generateReturnTypeTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
  preludeTypeInfo: PreludeTypeInfo,
): GeneratedSnippets | null {
  if (node.type !== "type-return" && node.type !== "return") {
    return null
  }

  const typeInstanceSnippet =
    preludeTypeInfo.typeSnippets.length === 0
      ? checkAndGenerateTypeInstanceTs(node.args[0], state, fixture)
      : generatePreStatementAndTypeForParam(
          node,
          state,
          fixture,
          preludeTypeInfo,
        )
  return fromComplicated(node, [": ", typeInstanceSnippet])
}

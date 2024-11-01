import type { GeneratorFixture } from "code-gen/ts/ts-generator"
import type { TreeNode } from "tree"
import type { GeneratorState } from "../generator-state"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets"

export function generateParamsTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
) {
  return separateSnippetsWithCommas(node, state.blockParametersSoFar.map(p => p.inlineSnippet))
}

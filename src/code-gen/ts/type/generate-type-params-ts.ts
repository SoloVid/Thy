import { fromComplicated } from "code-gen/utils/from-complicated"
import type { TreeNode } from "tree"
import type { GeneratorState } from "../generator-state"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets"

export function generateTypeParamsTs(  node: TreeNode,
  state: GeneratorState,
) {
  return fromComplicated(node, [
    "<",
    separateSnippetsWithCommas(node, state.blockTypeParametersSoFar.map(p => p.inlineSnippet)),
    ">",
  ])
}

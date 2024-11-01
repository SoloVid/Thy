import type { TreeNode } from "tree"
import type { GeneratorState } from "../../generator-state"
import { fromComplicated } from "../../utils/from-complicated"

export function generateTypeParamsTs(  node: TreeNode,
  state: GeneratorState,
) {
  return state.blockTypeParametersSoFar.length === 0 ? "" : fromComplicated(node, [
    "<",
    state.blockTypeParametersSoFar.map((tp) => tp.inlineSnippet),
    ">",
  ])
}

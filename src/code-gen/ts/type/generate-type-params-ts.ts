import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { TreeNode } from "tree"
import assert from "utils/assert"
import type { GeneratorState } from "../generator-state"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets"

export function generateTypeParamsForBlockTs(
  node: TreeNode,
  state: GeneratorState,
) {
  assert(
    state.block !== null,
    "generateTypeParamsForBlockTs() should only be called in a block",
  )
  if (state.block.typeParametersSoFar.length === 0) {
    return fromNode(node, "")
  }
  return fromComplicated(node, [
    "<",
    separateSnippetsWithCommas(
      node,
      state.block.typeParametersSoFar.map((p) => p.inlineSnippet),
    ),
    ">",
  ])
}

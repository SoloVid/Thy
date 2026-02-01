import type { GeneratedSnippets } from "code-gen/generator.ts"
import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import type { TreeNode } from "tree"
import assert from "utils/assert.ts"
import type { GeneratorState } from "../generator-state.ts"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets.ts"

export function generateTypeArgsForBlockTs(
  node: TreeNode,
  state: GeneratorState,
) {
  assert(
    state.block !== null,
    "generateTypeArgsForBlockTs() should only be called in a block",
  )
  return generateTypeArgsTs(
    node,
    state.block.typeParametersSoFar.map((p) => fromNode(node, p.name)),
  )
}

export function generateTypeArgsTs(
  node: TreeNode,
  typeArgSnippets: readonly GeneratedSnippets[],
) {
  if (typeArgSnippets.length === 0) {
    return []
  }
  return fromComplicated(node, [
    "<",
    separateSnippetsWithCommas(node, typeArgSnippets),
    ">",
  ])
}

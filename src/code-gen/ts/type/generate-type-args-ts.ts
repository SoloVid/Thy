import type { GeneratedSnippets } from "code-gen/generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { TreeNode } from "tree"
import type { GeneratorState } from "../generator-state"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets"

export function generateTypeArgsForBlockTs(  node: TreeNode,
  state: GeneratorState,
) {
  return generateTypeArgsTs(node, state.blockTypeParametersSoFar.map(p => fromNode(node, p.name)))
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

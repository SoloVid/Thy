import type { GeneratedSnippets } from "code-gen/generator.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import type { TreeNode } from "tree"

export function separateSnippetsWithCommas(
  node: TreeNode,
  snippets: readonly GeneratedSnippets[],
): GeneratedSnippets {
  const soFar: GeneratedSnippets[] = []
  for (const snippet of snippets) {
    if (soFar.length > 0) {
      soFar.push(fromNode(node, ", "))
    }
    soFar.push(snippet)
  }
  return soFar
}

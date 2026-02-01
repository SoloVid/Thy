import type { TreeNode } from "../../../tree/tree-node.ts"
import type { GeneratedSnippets } from "../../generator.ts"
import type { GeneratorState } from "../generator-state.ts"

export function tryGenerateBlankLineTs(
  node: TreeNode,
  state: GeneratorState,
): void | GeneratedSnippets {
  if (node.type === "blank-line") {
    return []
    // return { text: "\n" }
  }
}

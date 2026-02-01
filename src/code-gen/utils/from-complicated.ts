import type { TreeNode } from "tree"
import type { GeneratedSnippets } from "../generator.ts"
import { fromNode } from "./from-node.ts"

export function fromComplicated(
  node: TreeNode,
  parts: readonly (GeneratedSnippets | string)[],
): GeneratedSnippets {
  return parts.map((p) => (typeof p === "string" ? fromNode(node, p) : p))
}

import type { TreeNode } from "tree"
import type { ErrorableTreeNode } from "./error.ts"

export function getFirstToken(node: TreeNode | ErrorableTreeNode) {
  if ("token" in node) {
    return node.token
  }
  return node.firstToken
}

export function getLastToken(node: TreeNode | ErrorableTreeNode) {
  if ("token" in node) {
    return node.token
  }
  return node.lastToken
}

import type { TokenRange, TreeNode } from "tree"
import { ErrorableTreeNode } from "./error"

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

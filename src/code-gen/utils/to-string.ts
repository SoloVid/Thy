import type { TreeNode } from "tree"
import { isAssignment, isCall } from "tree"

export function nodeToString(node: TreeNode): string {
  if ("token" in node) {
    return node.token.text
  }
  if (
    isCall(node) ||
    node.type === "type-call" ||
    node.type === "type-given-call"
  ) {
    return `${nodeToString(node.func)}()`
  }
  if (isAssignment(node) || node.type === "type-assignment") {
    return `${nodeToString(node.variable)} ${node.operator.text} ${nodeToString(node.call)}`
  }
  if (
    node.type === "value-property-access" ||
    node.type === "type-property-access"
  ) {
    return `${node.baseToken.text}.${node.propertyAccesses.map((pa) => pa.propertyToken.text).join(".")}`
  }
  return `<${node.type}>`
}

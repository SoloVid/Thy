import type { TreeNode } from "tree"
import type {
  MappedGeneratedSnippet,
  UnmappedGeneratedWhitespace,
} from "../generator"
import { fromToken } from "./from-token"
import { fromTokenRange } from "./from-token-range"

export function fromNode(
  node: TreeNode,
  text: string,
): MappedGeneratedSnippet | UnmappedGeneratedWhitespace {
  if (node.type === "blank-line") {
    return { text }
  }
  if ("token" in node) {
    return fromToken(node.token, text)
  }
  return fromTokenRange(node, text)
}

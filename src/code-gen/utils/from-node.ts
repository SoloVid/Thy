import type { TreeNode } from "tree"
import type {
  MappedGeneratedSnippet,
  UnmappedGeneratedWhitespace,
} from "../generator.ts"
import { fromToken } from "./from-token.ts"
import { fromTokenRange } from "./from-token-range.ts"

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

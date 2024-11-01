import type { TreeNode } from "tree";
import { GeneratedSnippets } from "../generator";
import { fromNode } from "./from-node";

export function fromComplicated(
  node: TreeNode,
  parts: (GeneratedSnippets | string)[]
): GeneratedSnippets {
  return parts.map((p) => (typeof p === "string" ? fromNode(node, p) : p));
}

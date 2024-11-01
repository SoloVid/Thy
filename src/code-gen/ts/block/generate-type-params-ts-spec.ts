import type { TreeNode } from "tree"
import { GeneratedSnippets } from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { PreludeTypeInfo } from "./prelude-type-info"

export function generateTypeParamsTsSpec(
  node: TreeNode,
  preludeTypeInfo: PreludeTypeInfo,
): {
  params: GeneratedSnippets
  args: GeneratedSnippets
} {
  if (preludeTypeInfo.typeParameters.length === 0) {
    return { params: fromNode(node, ""), args: fromNode(node, "") }
  }
  return {
    params: fromComplicated(node, [
      "<",
      preludeTypeInfo.typeParameters.map((tp) => tp.inlineSnippet),
      ">",
    ]),
    args: fromComplicated(node, [
      "<",
      fromNode(
        node,
        preludeTypeInfo.typeParameters.map((tp) => tp.name).join(", "),
      ),
      ">",
    ]),
  }
}

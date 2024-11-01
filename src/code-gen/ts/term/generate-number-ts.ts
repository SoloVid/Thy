import type { TreeNode } from "tree"
import { GeneratedSnippets } from "../../generator"
import { fromNode } from "code-gen/utils/from-node"
import { fromToken } from "code-gen/utils/from-token"
import { contextType, GeneratorState } from "../../generator-state"

export function tryGenerateNumberTs(
  node: TreeNode,
  state: GeneratorState,
): GeneratedSnippets | undefined {
  if (node.type === "number-literal") {
    const maybeAsConst =
      state.context === contextType.looseExpression ? "" : " as const"
    return [fromToken(node.token), fromNode(node, maybeAsConst)]
  }
}

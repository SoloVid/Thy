import { fromNode } from "code-gen/utils/from-node"
import { fromToken } from "code-gen/utils/from-token"
import type { TreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { contextType, GeneratorState } from "../generator-state"

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

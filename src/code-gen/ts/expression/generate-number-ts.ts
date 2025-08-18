import { fromNode } from "code-gen/utils/from-node"
import { fromToken } from "code-gen/utils/from-token"
import type { TreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { GeneratorState } from "../generator-state"
import { contextType } from "../generator-context"

export function tryGenerateNumberTs(
  node: TreeNode,
  state: GeneratorState,
): GeneratedSnippets | undefined {
  if (node.type === "number-literal") {
    // const maybeAsConst =
    //   state.context === contextType.looseExpression ? "" : " as const"
    // TODO: Figure out actual desired behavior of when not as const.
    const maybeAsConst = " as const"
    return [fromToken(node.token), fromNode(node, maybeAsConst)]
  }
}

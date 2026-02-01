import { fromNode } from "code-gen/utils/from-node.ts"
import { fromToken } from "code-gen/utils/from-token.ts"
import type { TreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import { GeneratorState } from "../generator-state.ts"
import { contextType } from "../generator-context.ts"

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

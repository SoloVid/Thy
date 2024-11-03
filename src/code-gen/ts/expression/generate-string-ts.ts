import { fromComplicated } from "code-gen/utils/from-complicated"
import type { TreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { GeneratorState } from "../generator-state"
import { contextType } from "../generator-context"

export function tryGenerateStringTs(
  node: TreeNode,
  state: GeneratorState,
): GeneratedSnippets | undefined {
  if (node.type === "string-literal") {
    // const maybeAsConst =
    //   state.context === contextType.looseExpression ? "" : " as const"
    // TODO: Figure out actual desired behavior of when not as const.
    const maybeAsConst = " as const"
    if (node.parts.length === 1 && node.parts[0].type === "string-content") {
      return fromComplicated(node, [
        JSON.stringify(node.parts[0].token.text),
        maybeAsConst,
      ])
    }
    return fromComplicated(node, [
      "`",
      ...node.parts.map((part) =>
        part.type === "string-content"
          ? part.token.text
          : fromComplicated(part, ["${", part.value.token.text, "}"]),
      ),
      "`",
      maybeAsConst,
    ])
  }
}

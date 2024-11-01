import type { GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromToken } from "code-gen/utils/from-token"
import type { Return, TreeNode } from "tree"
import type {
  GeneratedSnippets,
} from "../../generator"
import { contextType, type GeneratorState } from "../generator-state"
import { fromNode } from "code-gen/utils/from-node"
import { tryGenerateReturnTypeTs } from "../block/generate-return-type-ts"

export function tryGenerateReturnTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "type-return" || node.type === "return") {
    const returnTypeSnippets = tryGenerateReturnTypeTs(node, state, fixture)
    if (returnTypeSnippets) {
      state.blockReturnTypeSnippets = returnTypeSnippets
    }
    if (node.type === "return") {
      return generateReturnTs(node, state, fixture)
    } else {
      return fromNode(node, "void null")
    }
  }
}

export function generateReturnTs(
  node: Return,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const keywordSnippet = fromToken(node.func.token)

  const childState = state.makeChild({
    context: contextType.isolatedExpression,
  })
  const valueSnippet = fixture.generate(node.args[0], childState)

  // TODO: Also handle type.

  return fromComplicated(node, [keywordSnippet, " ", valueSnippet])
}

import type { Return, TreeNode } from "tree"
import {
  GeneratedSnippets,
  GeneratorFixture,
} from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromToken } from "code-gen/utils/from-token"
import { contextType, type GeneratorState } from "../../generator-state"

export function tryGenerateReturnTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "return") {
    return generateReturnTs(node, state, fixture)
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

  return fromComplicated(node, [keywordSnippet, " ", valueSnippet])
}

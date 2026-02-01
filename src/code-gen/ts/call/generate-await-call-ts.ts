import { GeneratorFixture } from "code-gen/ts/ts-generator.ts"
import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromToken } from "code-gen/utils/from-token.ts"
import type { AwaitCall, TreeNode } from "tree"
import { GeneratedSnippets } from "../../generator.ts"
import { type GeneratorState } from "../generator-state.ts"
import { contextType } from "../generator-context.ts"

export function tryGenerateAwaitCallTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "await-call") {
    return generateAwaitCallTs(node, state, fixture)
  }
}

export function generateAwaitCallTs(
  node: AwaitCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const keywordSnippet = fromToken(node.func.token, "await")

  const childState = state.makeChild({
    context: contextType.isolatedExpression,
  })
  const valueSnippet = fixture.generate(node.args[0], childState)

  return fromComplicated(node, [keywordSnippet, " ", valueSnippet])
}

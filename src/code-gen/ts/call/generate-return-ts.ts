import type { GeneratorFixture } from "code-gen/ts/ts-generator.ts"
import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import { fromToken } from "code-gen/utils/from-token.ts"
import { nodeError } from "common/compile-error.ts"
import type { Return, TreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import { tryGenerateReturnTypeTs } from "../block/generate-return-type-ts.ts"
import { contextType } from "../generator-context.ts"
import { type GeneratorState } from "../generator-state.ts"

export function tryGenerateReturnTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "type-return" || node.type === "return") {
    if (state.block === null) {
      state.addError(nodeError(node, "return cannot be used in this context"))
      return fromNode(node, "void null")
    }

    const returnTypeSnippets = tryGenerateReturnTypeTs(node, state, fixture)
    if (returnTypeSnippets) {
      state.block.returnTypeSnippets = returnTypeSnippets
    }
    if (node.type === "return") {
      return generateReturnTs(node, state, fixture)
    } else {
      return fromNode(node, `void "type return erased"`)
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

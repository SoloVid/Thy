import type { GeneratorFixture } from "code-gen/ts/ts-generator.ts"
import type { TreeNode } from "tree"
import assert from "utils/assert.ts"
import type { GeneratorState } from "../generator-state.ts"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets.ts"

export function generateParamsTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
) {
  assert(
    state.block !== null,
    "generateParamsTs() should only be called in a block",
  )
  return separateSnippetsWithCommas(
    node,
    state.block.parametersSoFar.map((p) => p.inlineSnippet),
  )
}

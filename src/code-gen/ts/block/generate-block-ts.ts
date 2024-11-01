import { GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromTokenRange } from "code-gen/utils/from-token-range"
import type { Block, TreeNode } from "tree"
import {
  GeneratedSnippets
} from "../../generator"
import { makeIndent } from "../../utils/indent"
import { contextType, GeneratorState } from "../generator-state"
import { generateTypeParamsTs } from "../type/generate-type-params-ts"
import { autoTightC } from "../utils/auto-tight"
import { generateBlockLinesTs } from "./generate-block-lines-ts"
import { generateParamsTs } from "./generate-params-ts"

export function tryGenerateBlockTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "block") {
    return generateBlockTs(node, state, fixture)
  }
}

export function generateBlockTs(
  block: Block,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const blockBodyState = state.makeChild({
    context: contextType.blockAllowingReturn,
    increaseIndent: true,
    newImplicitArguments: block.explicitParameterCount === 0,
  })
  let linesTs = generateBlockLinesTs(
    block,
    block.ideas,
    blockBodyState,
    fixture,
  )

  if (block.explicitParameterCount === 0 && blockBodyState.implicitArguments?.used) {
    const n = blockBodyState.implicitArguments.variableName
    const localName = n + "L"
    state.blockParametersSoFar.push({
      inlineSnippet: fromTokenRange(block, localName)
    })
    const space = makeIndent(blockBodyState.indentLevel)
    const parentObj = state.implicitArguments?.variableName ?? "{}"
    linesTs = [
      fromTokenRange(
        block,
        `${space}const ${n} = {...${localName}, ...${parentObj}} as const\n`,
      ),
      linesTs,
    ]
  }

  const definition = fromComplicated(block, [
    generateTypeParamsTs(block, state),
    "(",
      generateParamsTs(block, state, fixture),
    ")",
    ...(state.blockReturnTypeSnippets ? [": ", state.blockReturnTypeSnippets] : []),
    " => {\n",
    linesTs,
    makeIndent(state.indentLevel),
    "}",
  ])

  return autoTightC(state, block, definition)
}

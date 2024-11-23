import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromTokenRange } from "code-gen/utils/from-token-range"
import type { Block, TreeNode } from "tree"
import { GeneratedSnippets } from "../../generator"
import { makeIndent } from "../../utils/indent"
import { contextType } from "../generator-context"
import { GeneratorState, makeGeneratorBlockState } from "../generator-state"
import type { GeneratorFixture } from "../ts-generator"
import { generateTypeParamsForBlockTs } from "../type/generate-type-params-ts"
import { autoTightC } from "../utils/auto-tight"
import { generateBlockLinesTs } from "./generate-block-lines-ts"
import { generateParamsTs } from "./generate-params-ts"
import { trace } from "../utils/debug"

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
  trace("generateBlockTs()")
  if (state.context === contextType.topLevel) {
    const blockBodyState = state.makeChild({
      symbolTable: block.symbolTable,
      context: contextType.blockAllowingReturn,
      assignmentContextName: null,
    })
    return generateBlockLinesTs(block, block.ideas, blockBodyState, fixture)
  }

  const blockBodyBlockState = makeGeneratorBlockState(block)
  const blockBodyState = state.makeChild({
    symbolTable: block.symbolTable,
    block: blockBodyBlockState,
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
  state.preStatementGenerators.push(
    ...blockBodyBlockState.preStatementGenerators,
  )

  if (
    block.explicitParameterCount === 0 &&
    blockBodyState.implicitArguments?.used
  ) {
    const n = blockBodyState.implicitArguments.variableName
    const localName = n + "L"
    blockBodyBlockState.parametersSoFar.push({
      inlineSnippet: fromComplicated(block, [localName, " = {} as never"]),
    })
    const space = makeIndent(blockBodyState.indentLevel)
    const parentObj = state.implicitArguments?.variableName ?? "{}"
    linesTs = [
      fromTokenRange(
        block,
        `${space}const ${n} = { ...${localName} as (typeof ${localName} extends never ? {} : typeof ${localName}), ...${parentObj} } as const\n`,
      ),
      linesTs,
    ]
  }

  const definition = fromComplicated(block, [
    generateTypeParamsForBlockTs(block, blockBodyState),
    "(",
    generateParamsTs(block, blockBodyState, fixture),
    ")",
    ...(blockBodyBlockState.returnTypeSnippets
      ? [": ", blockBodyBlockState.returnTypeSnippets]
      : []),
    " => {\n",
    linesTs,
    makeIndent(state.indentLevel),
    "}",
  ])

  return autoTightC(state, block, definition)
}

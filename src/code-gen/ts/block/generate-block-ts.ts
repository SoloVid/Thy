import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromTokenRange } from "code-gen/utils/from-token-range.ts"
import type { Block, TreeNode } from "tree"
import { GeneratedSnippets } from "../../generator.ts"
import { makeIndent } from "../../utils/indent.ts"
import { contextType } from "../generator-context.ts"
import { GeneratorState, makeGeneratorBlockState } from "../generator-state.ts"
import type { GeneratorFixture } from "../ts-generator.ts"
import { generateTypeParamsForBlockTs } from "../type/generate-type-params-ts.ts"
import { trace } from "../utils/debug.ts"
import { generateBlockLinesTs } from "./generate-block-lines-ts.ts"
import { generateParamsTs } from "./generate-params-ts.ts"

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

  return fromComplicated(block, [
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
}

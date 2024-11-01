import type { Block, Idea, TreeNode } from "tree"
import {
  GeneratedSnippets,
  GeneratorFixture
} from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromTokenRange } from "code-gen/utils/from-token-range"
import { contextType, GeneratorState } from "../../generator-state"
import { makeIndent } from "../../utils/indent"
import { generateBlockLinesTs } from "./generate-block-lines-ts"
import { generateParameterTs } from "./generate-parameter-ts"
import { generateReturnTypeTs } from "./generate-return-type-ts"
import { generateTypeParameterTsSpec } from "./generate-type-parameter-ts-spec"
import type { PreludeTypeInfo } from "./prelude-type-info"
import { generateTypeParamsTs } from "../type/generate-type-params-ts"

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
  let preludeTypeSnippetsDone = false
  const parameterSpecs: GeneratedSnippets = []
  let returnTypeSpec: GeneratedSnippets | null = null
  let preludeTypeInfo: PreludeTypeInfo = {
    typeParameters: [],
    typeSnippets: [],
  }
  const imperativeIdeas: Idea[] = []
  for (const idea of block.ideas) {
    const tps = generateTypeParameterTsSpec(idea, state, fixture, preludeTypeInfo)
    if (tps !== null) {
      let inlineSnippets =
        preludeTypeInfo.typeParameters.length > 0
          ? [fromTokenRange(block, ", "), tps.inlineParamSnippet]
          : tps.inlineParamSnippet
      preludeTypeInfo = {
        typeParameters: [
          ...preludeTypeInfo.typeParameters,
          {
            name: tps.paramName,
            inlineSnippet: inlineSnippets,
          },
        ],
        typeSnippets: [...preludeTypeInfo.typeSnippets, tps.blockSnippet],
      }
      continue
    }
    if (!preludeTypeSnippetsDone && idea.type === "type-assignment") {
      const gen = fixture.generate(idea, state)
      preludeTypeInfo = {
        typeParameters: preludeTypeInfo.typeParameters,
        typeSnippets: [...preludeTypeInfo.typeSnippets, gen],
      }
      continue
    }
    preludeTypeSnippetsDone = true

    const ps = generateParameterTs(idea, state, fixture, preludeTypeInfo)
    if (ps !== null) {
      if (parameterSpecs.length > 0) {
        parameterSpecs.push(fromTokenRange(block, ", "))
      }
      parameterSpecs.push(ps)
      continue
    }

    const rts = generateReturnTypeTs(idea, state, fixture, preludeTypeInfo)
    if (rts !== null) {
      returnTypeSpec = rts
      if (idea.type === "type-return") {
        continue
      }
    }

    imperativeIdeas.push(idea)
  }

  const blockBodyState = state.makeChild({
    context: contextType.blockAllowingReturn,
    increaseIndent: true,
    newImplicitArguments: parameterSpecs.length === 0,
  })
  let linesTs = generateBlockLinesTs(
    block,
    imperativeIdeas,
    blockBodyState,
    fixture,
  )

  if (parameterSpecs.length === 0 && blockBodyState.implicitArguments?.used) {
    const n = blockBodyState.implicitArguments.variableName
    const localName = n + "L"
    parameterSpecs.push(fromTokenRange(block, localName))
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
    parameterSpecs,
    ")",
    returnTypeSpec ?? [],
    " => {\n",
    ...preludeTypeInfo.typeSnippets
      .map((s) => [makeIndent(state.indentLevel + 1), s, "\n"])
      .flat(),
    linesTs,
    makeIndent(state.indentLevel),
    "}",
  ])

  if (state.context === contextType.looseExpression) {
    return fromComplicated(block, ["(", definition, ")"])
  }
  return definition
}

export function generateBlockTs2(
  block: Block,
  state: GeneratorState,
  fixture: GeneratorFixture,
) {
  return block.ideas.reduce((soFar, idea, i) => {
    if (isTypeParameter(idea)) {
      if (needsPrecedingBlockLines(idea)) {
        addPreludeLines(idea)
        addTypeParameterUsingPrelude(idea)
      } else {
        addTypeParameterWithoutPrelude(idea)
      }
    }
    // if ()
    // if (idea.type === "type-assignment" && idea.call.type === "type-given-call") {

    // }
  }, {})
}
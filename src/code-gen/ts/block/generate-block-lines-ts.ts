import type { Block, Idea } from "tree"
import type { GeneratedSnippets, GeneratorFixture } from "../../generator"
import type { GeneratorState } from "../../generator-state"
import { genIndent } from "../../utils/indent"
import { generateImpliedReturnTs } from "./generate-implied-return-ts"
import { resolvePreStatementGenerator } from "./resolve-pre-statement-generator"

export function generateBlockLinesTs(
  block: Block,
  ideas: readonly Idea[],
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  return [
    generateBlockExplicitLinesTs(block, ideas, state, fixture),
    generateImpliedReturnTs(block, state),
  ]
}

export function generateBlockExplicitLinesTs(
  block: Block,
  ideas: readonly Idea[],
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const implementationLines = ideas.map((i) => {
    const lineState = state.makeChild({
      block: block,
      context: state.context,
      newPreStatementsArray: true,
    })
    const primaryGeneratedLine = fixture.generate(i, lineState)
    state.preStatementGenerators.push(...lineState.blockPreStatementGenerators)
    const preGeneratedLines = lineState.preStatementGenerators.map((g) =>
      resolvePreStatementGenerator(g, state, fixture),
    )
    const allGeneratedLines = [
      ...preGeneratedLines.flat(1),
      primaryGeneratedLine,
    ]
    return allGeneratedLines.map((l) => [
      genIndent(state.indentLevel),
      l,
      { text: "\n" },
    ])
  })

  return implementationLines
}

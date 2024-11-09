import type { Block, Idea } from "tree"
import type { GeneratedSnippet, GeneratedSnippets } from "../../generator"
import { genIndent } from "../../utils/indent"
import type { GeneratorState } from "../generator-state"
import type { GeneratorFixture } from "../ts-generator"
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
      context: state.context,
      newPreStatementsArray: true,
    })
    const primaryGeneratedLine = fixture.generate(i, lineState)
    const preGeneratedLines = lineState.preStatementGenerators.map((g) =>
      resolvePreStatementGenerator(g, state, fixture),
    )
    const allGeneratedLines = [
      ...preGeneratedLines.flat(1),
      primaryGeneratedLine,
    ]
    return allGeneratedLines.map((l) => {
      // There's an open issue in TS 4.7 about typing this correctly. https://github.com/microsoft/TypeScript/issues/49280
      const collapsedLine: GeneratedSnippet[] = [l].flat(
        Infinity as 1,
      ) as GeneratedSnippet[]
      if (collapsedLine.length === 0) {
        return { text: "\n" }
      }
      return [genIndent(state.indentLevel), collapsedLine, { text: "\n" }]
    })
  })

  return implementationLines
}

import type { Block, Idea } from "tree"
import type { GeneratedSnippet, GeneratedSnippets } from "../../generator.ts"
import { genIndent } from "../../utils/indent.ts"
import type { GeneratorState } from "../generator-state.ts"
import type { GeneratorFixture } from "../ts-generator.ts"
import { generateImpliedReturnTs } from "./generate-implied-return-ts.ts"
import { resolvePreStatementGenerator } from "./resolve-pre-statement-generator.ts"

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
  return ideas.map((idea, i) => {
    const lineState = state.makeChild({
      context: state.context,
      newPreStatementsArray: true,
    })
    const primaryGeneratedLine = fixture.generate(idea, lineState)
    const preGeneratedLines = lineState.preStatementGenerators.map((g) =>
      resolvePreStatementGenerator(g, state, fixture),
    )
    const allGeneratedLines = [
      ...preGeneratedLines.flat(1),
      primaryGeneratedLine,
    ]
    if (
      Array.isArray(primaryGeneratedLine) &&
      primaryGeneratedLine.length === 0 &&
      preGeneratedLines.length === 0 &&
      idea.type === "let-call"
    ) {
      return []
    }
    return allGeneratedLines.map((l) => {
      // There's an open issue in TS 4.7 about typing this correctly. https://github.com/microsoft/TypeScript/issues/49280
      const collapsedLine: GeneratedSnippet[] = [l].flat(
        Infinity as 1,
      ) as GeneratedSnippet[]
      const maybeNewLine =
        idea.type !== "blank-line" ||
        ideas.slice(i + 1).some((idea2) => idea2.type !== "blank-line")
          ? { text: "\n" }
          : { text: "" }
      if (collapsedLine.length === 0) {
        return [maybeNewLine]
      }
      state.block?.ideaSnippets.push([
        genIndent(state.indentLevel),
        ...collapsedLine,
        maybeNewLine,
      ])
      return [genIndent(state.indentLevel), ...collapsedLine, maybeNewLine]
    })
  })
}

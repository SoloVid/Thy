import type { GeneratorFixture, IndependentCodeGeneratorFunc } from "code-gen/ts/ts-generator"
import type {
  GeneratedSnippets,
} from "../../generator"
import { GeneratorState, contextType } from "../generator-state"

export function resolvePreStatementGenerator(
  generator: IndependentCodeGeneratorFunc,
  state: GeneratorState,
  fixture: GeneratorFixture,
): readonly GeneratedSnippets[] {
  const lineState = state.makeChild({
    context: contextType.blockNoReturn,
    newPreStatementsArray: true,
  })
  const directSnippet = generator(lineState, fixture)
  if (lineState.preStatementGenerators.length === 0) {
    return [directSnippet]
  }
  const resolvedPreStatements = lineState.preStatementGenerators.map((g) =>
    resolvePreStatementGenerator(g, state, fixture),
  )
  return [...resolvedPreStatements.flat(1), directSnippet]
}

import type {
  GeneratorFixture,
  IndependentCodeGeneratorFunc,
} from "code-gen/ts/ts-generator.ts"
import type { GeneratedSnippets } from "../../generator.ts"
import { GeneratorState } from "../generator-state.ts"
import { contextType } from "../generator-context.ts"

export function resolvePreStatementGenerator(
  generator: IndependentCodeGeneratorFunc,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets[] {
  const lineState = state.makeChild({
    context: contextType.blockNoReturn,
    // There is currently no category of pre-statement generator that is not a type,
    // and I'm not immediately sure how to translate isTypeContext here otherwise.
    isTypeContext: true,
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

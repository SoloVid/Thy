import type { TreeNode } from "tree"
import assert from "utils/assert"
import type { GeneratedSnippets } from "../../generator"
import { fromComplicated } from "../../utils/from-complicated"
import { indentSnippets, makeIndent } from "../../utils/indent"
import { generateParamsTs } from "../block/generate-params-ts"
import type { GeneratorState } from "../generator-state"
import type {
  GeneratorFixture,
  IndependentCodeGeneratorFunc,
} from "../ts-generator"
import { generateTypeArgsForBlockTs } from "./generate-type-args-ts"
import { generateTypeParamsForBlockTs } from "./generate-type-params-ts"

export function makeParameterTypePackage(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
  nameBase: string,
  leafValueSnippets: GeneratedSnippets,
) {
  const blockState = state.block
  assert(
    blockState !== null,
    "makeParameterTypePackage() should only be called in a block",
  )

  const packageClassName = `_${nameBase}_TypePackage`
  const typeParamsSoFar = generateTypeParamsForBlockTs(node, state)
  const typeArgsSoFar = generateTypeArgsForBlockTs(node, state)
  const paramsSoFar = generateParamsTs(node, state, fixture)
  const ideasSoFar = [...blockState.ideaSnippets]

  const packageGenerator: IndependentCodeGeneratorFunc = (s, f) => {
    const indent = makeIndent(s.indentLevel)
    const indent2 = makeIndent(s.indentLevel + 1)
    return fromComplicated(node, [
      `class ${packageClassName}`,
      typeParamsSoFar,
      ` { f(`,
      paramsSoFar,
      `) {\n`,
      ideasSoFar.map((snippet) => indentSnippets(snippet, s.indentLevel + 1)),
      indent2,
      `return `,
      leafValueSnippets,
      "\n",
      indent,
      `} }`,
    ])
  }

  const tsType = fromComplicated(node, [
    `ReturnType<${packageClassName}`,
    typeArgsSoFar,
    `["f"]>`,
  ])

  return {
    preStatementGenerator: packageGenerator,
    tsType,
  }
}

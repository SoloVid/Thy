import type { TreeNode } from "tree"
import type { GeneratedSnippets, GeneratorFixture, IndependentCodeGeneratorFunc } from "../../generator"
import type { GeneratorState } from "../../generator-state"
import { fromComplicated } from "../../utils/from-complicated"
import { fromNode } from "../../utils/from-node"
import { indentSnippets, makeIndent } from "../../utils/indent"
import { generateTypeParamsTs } from "./generate-type-params-ts"

export function makeParameterTypePackage(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
  nameBase: string,
  leafValueSnippets: GeneratedSnippets,
) {
  const packageClassName = `_${nameBase}_TypePackage`
  const typeParamsSoFar = generateTypeParamsTs(node, state)
  const typeArgsSoFar = state.blockTypeParametersSoFar.length === 0 ? "" : fromComplicated(node, [
    "<",
    state.blockTypeParametersSoFar.map((tp) => fromNode(node, tp.name)),
    ">",
  ])
  const paramsSoFar: GeneratedSnippets[] = []
  for (const p of state.blockParametersSoFar) {
    if (paramsSoFar.length > 0) {
      paramsSoFar.push(fromNode(node, ", "))
    }
    paramsSoFar.push(p.inlineSnippet)
  }

  const packageGenerator: IndependentCodeGeneratorFunc = (s, f) => {
    const indent = makeIndent(s.indentLevel)
    const indent2 = makeIndent(s.indentLevel + 1)
    return fromComplicated(node, [
      `class ${packageClassName}`,
      typeParamsSoFar,
      ` { f(`, paramsSoFar, `) {\n`,
      state.blockIdeaSnippets.map((snippet) => indentSnippets(snippet, s.indentLevel + 1)),
      indent2, `return `, leafValueSnippets, "\n",
      indent,
      `} }`,
    ])
  }

  const tsType = fromComplicated(
    node,
    [
      `ReturnType<${packageClassName}`,
      typeArgsSoFar,
      `["f"]>`
    ]
  )

  return {
    preStatementGenerator: packageGenerator,
    tsType,
  }
}

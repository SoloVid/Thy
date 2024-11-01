import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromToken } from "code-gen/utils/from-token"
import type { Block } from "tree"
import { GeneratedSnippets } from "../../generator"
import { genIndent } from "../../utils/indent"
import type { GeneratorState } from "../generator-state"

export function generateImpliedReturnTs(block: Block, state: GeneratorState) {
  const impliedLines: GeneratedSnippets = []
  // TODO: Get local variables stuff working again (probably from tree symbol table?)
  if (state.localVariables.length > 0) {
    const impliedReturn = state.localVariables.map((v) => {
      const ind = genIndent(state.indentLevel + 1)
      const genT = fromToken(v.token, v.name)
      if (v.isConstant) {
        return [ind, genT]
      }
      return fromComplicated(block, [
        ind,
        "get ",
        genT,
        "() { return ",
        genT,
        " },\n",
        ind,
        "set ",
        genT,
        "(__) { ",
        genT,
        " = __ }",
      ])
    })
    impliedLines.push(
      fromComplicated(block, [
        genIndent(state.indentLevel),
        "return {\n",
        impliedReturn,
        "\n",
        genIndent(state.indentLevel),
        "}\n",
      ]),
    )
  }
  return impliedLines
}

import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromToken } from "code-gen/utils/from-token.ts"
import { type Block, returnStyle } from "tree"
import { genIndent } from "../../utils/indent.ts"
import type { GeneratorState } from "../generator-state.ts"
import { ContextType, contextType } from "../generator-context.ts"

const allowedContexts: readonly ContextType[] = [
  contextType.blockAllowingReturn,
]

export function generateImpliedReturnTs(block: Block, state: GeneratorState) {
  if (
    block.returnStyle === returnStyle.explicitReturn ||
    !allowedContexts.includes(state.context)
  ) {
    return []
  }
  const localSymbolEntries = [
    ...(state.symbolTable?.localSymbols.entries() ?? []),
  ]
  const symbolEntriesToExport = block.returnStyle === returnStyle.explicitExport
    ? localSymbolEntries.filter(
      ([, symbolInfo]) => symbolInfo.visibility === "export",
    )
    : localSymbolEntries.filter(
      ([, symbolInfo]) => symbolInfo.visibility !== "private",
    )
  const impliedReturn = symbolEntriesToExport.map(
    ([symbolName, symbolInfo]) => {
      const ind = genIndent(state.indentLevel + 1)
      const genT = fromToken(symbolInfo.token, symbolName)
      if (symbolInfo.isConstant) {
        return fromComplicated(block, [ind, genT, ",\n"])
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
        " = __ },\n",
      ])
    },
  )
  return [
    fromComplicated(block, [
      genIndent(state.indentLevel),
      "return {\n",
      impliedReturn,
      genIndent(state.indentLevel),
      "}\n",
    ]),
  ]
}

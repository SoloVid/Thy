import type { TreeNode } from "tree"
import {
  GeneratedSnippets,
  GeneratorFixture,
} from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromToken } from "code-gen/utils/from-token"
import type { GeneratorState } from "../../generator-state"
import { checkAndGenerateTypeInstanceTs } from "../type/generate-type-instance-ts"
import { generatePreStatementAndTypeForParam } from "./generatePreStatementAndTypeForParam"
import type { PreludeTypeInfo } from "./prelude-type-info"

export function generateTypeParameterTsSpec(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
  preludeTypeInfo: PreludeTypeInfo,
): {
  paramName: string
  inlineParamSnippet: GeneratedSnippets
  blockSnippet: GeneratedSnippets
} | null {
  if (node.type !== "type-assignment") {
    return null
  }
  if (node.call.type !== "type-given-call") {
    return null
  }

  const paramName = `_${node.variable.token.text}_Param`
  const inlineParamSnippet: GeneratedSnippets[] = [
    fromToken(node.variable.token, paramName),
  ]
  if (node.call.args.length !== 0) {
    inlineParamSnippet.push(
      fromComplicated(node.call.args[0], [
        " extends ",
        generatePreStatementAndTypeForParam(
          node.call,
          state,
          fixture,
          preludeTypeInfo,
          node.variable.token.text,
        ),
      ]),
    )

    if (node.call.args.length > 1) {
      const defaultTypeSnippet = checkAndGenerateTypeInstanceTs(
        node.call.args[1],
        state,
        fixture,
      )
      inlineParamSnippet.push(
        fromComplicated(node.call.args[1], [" = ", defaultTypeSnippet]),
      )
    }
  }

  return {
    paramName: paramName,
    inlineParamSnippet: inlineParamSnippet,
    blockSnippet: fromComplicated(node, [
      "const ",
      node.variable.token.text,
      " = undefined as unknown as ",
      paramName,
    ]),
  }
}

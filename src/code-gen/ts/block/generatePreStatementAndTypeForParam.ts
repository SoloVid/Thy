import type { GivenCall, TypeGivenCall } from "tree"
import { GeneratorFixture } from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import type { GeneratorState } from "../../generator-state"
import { makeIndent } from "../../utils/indent"
import { checkAndGenerateTypeInstanceTs } from "../type/generate-type-instance-ts"
import { generateTypeParamsTsSpec } from "./generate-type-params-ts-spec"
import type { PreludeTypeInfo } from "./prelude-type-info"

export function generatePreStatementAndTypeForParam(
  givenCallNode: GivenCall | TypeGivenCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
  preludeTypeInfo: PreludeTypeInfo,
  name?: string,
) {
  const typeNode =
    givenCallNode.type === "given-call"
      ? givenCallNode.typeArgs[0]
      : givenCallNode.args[0]
  const intermediateName =
    (name ? `_${name}` : state.getUniqueVariableName()) + "_TypePackage"
  const intermediateTypeParams = generateTypeParamsTsSpec(
    givenCallNode,
    preludeTypeInfo,
  )
  const extendedTypeSnippet = checkAndGenerateTypeInstanceTs(
    typeNode,
    state,
    fixture,
  )

  state.addPreStatementGenerator((s, f) => {
    const indent = makeIndent(s.indentLevel)
    const indent2 = makeIndent(s.indentLevel + 1)
    return fromComplicated(givenCallNode, [
      `class ${intermediateName}`,
      intermediateTypeParams.params,
      ` { f() {\n`,
      preludeTypeInfo.typeSnippets.map((snippet) =>
        fromComplicated(givenCallNode, [indent2, snippet, "\n"]),
      ),
      indent2,
      `return undefined as unknown as `,
      extendedTypeSnippet,
      "\n",
      indent,
      `} }`,
    ])
  })

  return fromComplicated(typeNode, [
    "ReturnType<",
    intermediateName,
    intermediateTypeParams.args,
    `["f"]>`,
  ])
}

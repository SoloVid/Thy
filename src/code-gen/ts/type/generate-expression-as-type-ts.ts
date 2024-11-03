import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { TypedTreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator"
import type { GeneratorState } from "../generator-state"
import type { GeneratorFixture } from "../ts-generator"

export function generateExpressionAsTypeTs(
  node: TypedTreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  if (isSimpleNamedExpression(node)) {
    return [fromNode(node, "typeof "), fixture.generate(node, state)]
  }

  const name = `${state.getUniqueVariableName()}_WrappedType`
  state.addPreStatementGenerator((s, f) =>
    fromComplicated(node, [
      `function ${name}() { return `,
      fixture.generate(node, s),
      ` }`,
    ]),
  )
  return fromComplicated(node, [`ReturnType<typeof ${name}>`])
}

function isSimpleNamedExpression(node: TypedTreeNode) {
  return (
    node.type === "value-identifier" ||
    node.type === "type-identifier" ||
    (node.type === "value-property-access" &&
      node.base.type === "value-identifier") ||
    (node.type === "type-property-access" &&
      (node.base.type === "type-identifier" ||
        node.base.type === "value-identifier"))
  )
}

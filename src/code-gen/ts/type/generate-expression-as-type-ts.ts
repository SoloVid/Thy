import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { TypedTreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator"
import type { GeneratorState } from "../generator-state"
import type { GeneratorFixture } from "../ts-generator"
import { trace } from "../utils/debug"
import { contextType } from "../generator-context"
import { nodeToString } from "code-gen/utils/to-string"

export function generateExpressionAsTypeTs(
  node: TypedTreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  trace(`generateExpressionAsTypeTs() <= ${nodeToString(node)}`)
  // console.log(state)
  if (isSimpleNamedExpression(node)) {
    return [fromNode(node, "typeof "), fixture.generate(node, state)]
  }
  if (node.type === "type-given-call") {
    return fixture.generateAsType(node, state)
  }

  const nameBase = state.assignmentContextName
    ? `_${state.assignmentContextName}`
    : state.getUniqueVariableName()
  const name = `${nameBase}_WrappedType`
  state.addPreStatementGenerator((s, f) =>
    fromComplicated(node, [
      `function ${name}() { return `,
      fixture.generate(
        node,
        s.makeChild({
          assignmentContextName: state.assignmentContextName,
          context: contextType.isolatedExpression,
        }),
      ),
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

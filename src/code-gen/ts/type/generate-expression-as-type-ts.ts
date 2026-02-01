import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import type { TypedTreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import type { GeneratorState } from "../generator-state.ts"
import type { GeneratorFixture } from "../ts-generator.ts"
import { trace } from "../utils/debug.ts"
import { contextType } from "../generator-context.ts"
import { nodeToString } from "code-gen/utils/to-string.ts"

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
    ])
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

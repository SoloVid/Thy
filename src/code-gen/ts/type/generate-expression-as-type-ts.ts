import type { GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { TypedTreeNode } from "tree"
import type {
  GeneratedSnippets,
} from "../../generator"
import type { GeneratorState } from "../generator-state"

export function generateExpressionAsTypeTs(
  node: TypedTreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const simpleTypeCallGenerated = tryGenerateSimpleTypeCallTs(node, state, fixture)
  if (simpleTypeCallGenerated) {
    return simpleTypeCallGenerated
  }

  if (isSimpleNamedExpression(node)) {
    return [fromNode(node, "typeof "), fixture.generate(node, state)]
  }

  const name = `${state.getUniqueVariableName()}_WrappedType`
  state.addPreStatementGenerator((s, f) =>
    fromComplicated(node, [
      `function ${name}() { return `,
      fixture.generate(node, state),
      ` }`,
    ]),
  )
  return fromComplicated(node, [`ReturnType<typeof ${name}>`])
}

function tryGenerateSimpleTypeCallTs(
  node: TypedTreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets | void {
  if (node.type !== "type-call") {
    return
  }
  const funcIsSimple = isSimpleNamedExpression(node.func)
  const argsAreSimple = node.args.reduce((allSimple, a) => {
    return allSimple && isSimpleNamedExpression(a)
  }, true)
  if (funcIsSimple && argsAreSimple) {
    return fixture.standardLibrary.simpleTypeCallGenerator(node, state, fixture)
  }
}

function isSimpleNamedExpression(node: TypedTreeNode) {
  return node.type === "value-identifier" || node.type === "type-identifier" || (node.type === "value-property-access" && node.base.type === "value-identifier") || (node.type === "type-property-access" && (node.base.type === "type-identifier" || node.base.type === "value-identifier"))
}

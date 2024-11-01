import { fromNode } from "code-gen/utils/from-node"
import type { Expression, TypeCall, TypeExpression } from "tree"
import type {
  GeneratedSnippets,
  GeneratorFixture,
} from "../../generator"
import type { GeneratorState } from "../../generator-state"
import { fromComplicated } from "code-gen/utils/from-complicated"

export function generateExpressionAsTypeTs(
  node: Expression | TypeExpression | TypeCall,
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
  node: Expression | TypeExpression | TypeCall,
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

function isSimpleNamedExpression(node: Expression | TypeExpression | TypeCall) {
  return node.type === "value-identifier" || node.type === "type-identifier" || (node.type === "value-property-access" && node.base.type === "value-identifier") || (node.type === "type-property-access" && (node.base.type === "type-identifier" || node.base.type === "value-identifier"))
}

import { nodeError } from "common/compile-error"
import type { TreeNode, TypeIdentifier, ValueIdentifier } from "tree"
import assert from "utils/assert"
import { GeneratedSnippets } from "../../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromTokenRange } from "code-gen/utils/from-token-range"
import { fromToken } from "code-gen/utils/from-token"
import type { GeneratorForGlobalSpec } from "../../../generator-for-global"
import { generateAssignmentTs } from "../../assignment/generate-assignment-ts"
import { generateTypeInstanceTs } from "../../type/generate-type-instance-ts"
import { autoTightS } from "../../utils/auto-tight"

export const defGenerator: GeneratorForGlobalSpec = {
  name: "def",
  generateValue(state) {
    return autoTightS(state, "<_T>(input: unknown) => (input as T)")
  },
  generateAssignment(node, state, fixture) {
    if (node.call.args.length === 0) {
      state.addError(nodeError(node.call.func, "def requires 1 argument"))
      return fromTokenRange(node, "undefined")
    }

    for (const arg of node.call.typeArgs.slice(1)) {
      state.addError(
        nodeError(arg, `def cannot take more than 1 type argument`),
      )
    }
    for (const arg of node.call.args.slice(1)) {
      state.addError(nodeError(arg, `def cannot take more than 1 argument`))
    }

    const childState = state.makeChild()
    const expressionTs = fixture.generate(node.call.args[0], childState)
    return generateAssignmentTs(
      node,
      state,
      fixture,
      expressionTs,
      node.call.typeArgs.length === 1
        ? fixture.generate(node.call.typeArgs[0], childState)
        : undefined,
    )
  },
  generateSimpleTypeCall(node, state, fixture) {
    if (node.args.length === 0) {
      state.addError(nodeError(node.func, "def requires 1 argument"))
      return fromTokenRange(node, "undefined")
    }

    for (const arg of node.args.slice(1)) {
      state.addError(nodeError(arg, `def cannot take more than 1 argument`))
    }

    return generateTypeInstanceTs(node.args[0], state, fixture)
  },
  generateTypeAssignment(node, state, fixture) {
    console.log("def type assignment generator")
    assert(
      node.call.type !== "type-call",
      "It should be impossible to hit this case because def is a value function, not a type function.",
    )
    if (node.call.args.length === 0 && node.call.typeArgs.length === 0) {
      state.addError(nodeError(node.call.func, "def requires 1 argument"))
      return fromTokenRange(node, "undefined")
    }

    for (const arg of node.call.args.slice(1)) {
      state.addError(
        nodeError(arg, `def cannot take more than 1 type argument`),
      )
    }
    for (const arg of node.call.args.slice(1)) {
      state.addError(nodeError(arg, `def cannot take more than 1 argument`))
    }

    function isSimpleNamed(
      arg: TreeNode,
    ): arg is ValueIdentifier | TypeIdentifier {
      return arg.type === "value-identifier" || arg.type === "type-identifier"
    }

    function generateSimple(
      arg: ValueIdentifier | TypeIdentifier,
      typeSnippet?: GeneratedSnippets,
    ) {
      return fromComplicated(node, [
        `const `,
        node.variable.token.text,
        ` = undefined as unknown as `,
        typeSnippet ?? generateTypeInstanceTs(arg, state, fixture),
      ])
    }

    if (
      node.call.typeArgs.length === 1 &&
      isSimpleNamed(node.call.typeArgs[0])
    ) {
      return generateSimple(node.call.typeArgs[0])
    }

    const oneArg = node.call.args[0]
    if (oneArg.type === "value-identifier") {
      return generateSimple(oneArg, fromToken(oneArg.token))
    }

    if (isSimpleNamed(oneArg)) {
      return generateSimple(oneArg)
    }
  },
}

import { fromComplicated } from "code-gen/utils/from-complicated"
import assert from "utils/assert"
import { generateAssignmentTs } from "../../block/generate-assignment-ts"
import { contextType } from "../../generator-context"
import type { GeneratorForNameSpec } from "../../generator-for-name"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error"
import { trace } from "code-gen/ts/utils/debug"

export const defGenerator: GeneratorForNameSpec = {
  name: "def",
  generateCall(node, state, fixture) {
    // There's nothing special to do if there are no arguments.
    if (node.args.length === 0) {
      return
    }
    addErrorForExcessArgs(node, state, "def", 1, 1)

    const childState = state.makeChild()
    return fixture.generate(node.args[0], childState)
  },
  generateAssignment(node, state, fixture) {
    // There's nothing special to do if there are no arguments.
    if (node.call.args.length === 0) {
      return
    }
    addErrorForExcessArgs(node.call, state, "def", 1, 1)

    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })
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
  generateTypeAssignment(node, state, fixture) {
    trace("def:generateTypeAssignment()")
    assert(
      node.call.type === "value-call",
      "It should be impossible to hit this case because def is a value function, not a type function.",
    )
    // If there are both value and type arguments, we don't want to do something fancy.
    if (node.call.args.length > 0 && node.call.typeArgs.length > 0) {
      return
    }
    addErrorForExcessArgs(node.call, state, "def", 1, 1)
    if (node.call.args.length > 0) {
      return fromComplicated(node, [
        `const `,
        node.variable.token.text,
        ` = undefined as unknown as `,
        fixture.generateAsType(node.call.args[0], state),
      ])
    }
    if (node.call.typeArgs.length > 0) {
      return fromComplicated(node, [
        `const `,
        node.variable.token.text,
        ` = undefined as unknown as `,
        fixture.generateAsType(node.call.typeArgs[0], state),
      ])
    }
  },
}

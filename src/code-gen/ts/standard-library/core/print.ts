import { contextType } from "code-gen/ts/generator-context"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { GeneratorForNameSpec } from "../../generator-for-name"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error"

export const printGenerator: GeneratorForNameSpec = {
  name: "print",
  generateCall(node, state, fixture) {
    if (node.args.length === 0) {
      return
    }
    addErrorForExcessArgs(node, state, "print", 1)

    const childState = state.makeChild({
      context: contextType.isolatedExpression
    })
    const targetTs = fixture.generate(node.args[0], childState)

    return fromComplicated(node, [
      fromNode(node.func, "console.log"),
      "(",
      targetTs,
      ")",
    ])
  },
}

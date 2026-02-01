import { contextType } from "code-gen/ts/generator-context.ts"
import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import type { GeneratorForNameSpec } from "../../generator-for-name.ts"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error.ts"

export const printGenerator: GeneratorForNameSpec = {
  name: "print",
  generateCall(node, state, fixture) {
    if (node.args.length === 0) {
      return
    }
    addErrorForExcessArgs(node, state, "print", 1)

    const childState = state.makeChild({
      context: contextType.isolatedExpression,
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

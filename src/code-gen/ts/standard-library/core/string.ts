import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import type { GeneratorForNameSpec } from "../../generator-for-name.ts"
import { autoTight } from "../../utils/auto-tight.ts"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error.ts"
import { contextType } from "code-gen/ts/generator-context.ts"

export const stringGenerator: GeneratorForNameSpec = {
  name: "string",
  generateCall(node, state, fixture) {
    if (node.args.length === 0) {
      return
    }
    addErrorForExcessArgs(node, state, "string", 4)

    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })

    return fromComplicated(
      node,
      [
        "`",
        ...node.args.map((a) => ["${", fixture.generate(a, childState), "}"]),
        "`",
      ].flat(),
    )
  },
}

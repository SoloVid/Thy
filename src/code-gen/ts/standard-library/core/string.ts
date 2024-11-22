import { fromComplicated } from "code-gen/utils/from-complicated"
import type { GeneratorForNameSpec } from "../../generator-for-name"
import { autoTight } from "../../utils/auto-tight"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error"
import { contextType } from "code-gen/ts/generator-context"

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
        ...node.args.map(a => ["${",fixture.generate(a, childState),"}"]),
        "`"
      ].flat(),
    )
  },
}

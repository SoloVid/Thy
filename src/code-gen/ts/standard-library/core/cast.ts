import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import type { GeneratorForNameSpec } from "../../generator-for-name.ts"
import { autoTight } from "../../utils/auto-tight.ts"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error.ts"

export const castGenerator: GeneratorForNameSpec = {
  name: "cast",
  generateCall(node, state, fixture) {
    if (node.args.length === 0) {
      return
    }
    addErrorForExcessArgs(node, state, "cast", 1, 1)

    const childState = state.makeChild()
    const targetTs = fixture.generate(node.args[0], childState)

    if (node.typeArgs.length === 0) {
      return targetTs
    }
    return fromComplicated(
      node,
      autoTight(state, [
        targetTs,
        "as unknown as ",
        fixture.generateAsType(node.typeArgs[0], childState),
      ]),
    )
  },
}

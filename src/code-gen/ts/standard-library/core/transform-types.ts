import { fromNode } from "code-gen/utils/from-node"
import type { GeneratorForNameSpec } from "../../generator-for-name"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error"
import { autoTightC } from "code-gen/ts/utils/auto-tight"

export const intersectionGenerator: GeneratorForNameSpec = {
  name: "All",
  generateTypeCall(node, state, fixture) {
    addErrorForExcessArgs(node, state, "All", 4)
    return autoTightC(state, node, node.args.map((a, i) => {
      const gen = fixture.generateAsType(a, state)
      if (i === 0) {
        return gen
      }
      return [fromNode(node.func, " & "), gen]
    }))
  },
}

export const unionGenerator: GeneratorForNameSpec = {
  name: "Some",
  generateTypeCall(node, state, fixture) {
    addErrorForExcessArgs(node, state, "Some", 4)
    return autoTightC(state, node, node.args.map((a, i) => {
      const gen = fixture.generateAsType(a, state)
      if (i === 0) {
        return gen
      }
      return [fromNode(node.func, " | "), gen]
    }))
  },
}

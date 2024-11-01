import { fromNode } from "code-gen/utils/from-node"
import type { GeneratorForGlobalSpec } from "../../../generator-for-global"
import { generateTypeInstanceTs } from "../../type/generate-type-instance-ts"
import { autoTightS } from "../../utils/auto-tight"

export const unionGenerator: GeneratorForGlobalSpec = {
  name: "Union",
  generateValue(state) {
    return autoTightS(
      state,
      "<_A, _B>(_a: _A, _b: _B) => (undefined as unknown as _A | _B)",
    )
  },
  generateSimpleTypeCall(node, state, fixture) {
    return node.args.map((a, i) => {
      const gen = generateTypeInstanceTs(a, state, fixture)
      if (i === 0) {
        return gen
      }
      return [fromNode(node.func, " | "), gen]
    })
  },
}

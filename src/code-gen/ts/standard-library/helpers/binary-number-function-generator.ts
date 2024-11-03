import { fromComplicated } from "code-gen/utils/from-complicated"
import type { GeneratorForNameSpec } from "../../generator-for-name"
import { contextType } from "code-gen/ts/generator-context"
import { autoTight } from "../../utils/auto-tight"
import { addErrorForExcessArgs } from "./too-many-args-error"

export function makeBinaryNumberFunctionGenerator(
  name: string,
  jsOperator: string,
): GeneratorForNameSpec {
  return {
    name: name,
    generateCall(node, state, fixture) {
      if (node.args.length < 2) {
        return
      }
      addErrorForExcessArgs(node, state, name, 2)
      const childState = state.makeChild({
        context: contextType.looseExpression,
      })
      return fromComplicated(
        node,
        autoTight(state, [
          fixture.generate(node.args[0], childState),
          ` ${jsOperator} `,
          fixture.generate(node.args[1], childState),
        ]),
      )
    },
  }
}

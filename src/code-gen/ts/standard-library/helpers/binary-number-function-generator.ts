import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import type { GeneratorForNameSpec } from "../../generator-for-name.ts"
import { contextType } from "code-gen/ts/generator-context.ts"
import { autoTight } from "../../utils/auto-tight.ts"
import { addErrorForExcessArgs } from "./too-many-args-error.ts"

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

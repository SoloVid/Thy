import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import type {
  GeneratorForNameParentSpec,
  GeneratorForNameSpec,
} from "../../generator-for-name.ts"
import { contextType } from "code-gen/ts/generator-context.ts"
import { autoTight } from "../../utils/auto-tight.ts"
import {
  makeLogicalFunctionGenerator,
  makeSequencedLogicalFunctionGenerator,
} from "../helpers/logical-function-generator.ts"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error.ts"

const all = makeLogicalFunctionGenerator("all", "&&")
const asc = makeSequencedLogicalFunctionGenerator("asc", "<")
const desc = makeSequencedLogicalFunctionGenerator("desc", ">")
const equal = makeSequencedLogicalFunctionGenerator("equal", "===")
const not: GeneratorForNameSpec = {
  name: "not",
  generateCall(node, state, fixture) {
    if (node.args.length === 0) {
      return
    }
    addErrorForExcessArgs(node, state, "not", 1)
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })
    return fromComplicated(
      node,
      autoTight(state, ["!", fixture.generate(node.args[0], childState)]),
    )
  },
}
const some = makeLogicalFunctionGenerator("some", "||")

export const checkGenerator: GeneratorForNameParentSpec = {
  name: "check",
  children: [all, asc, desc, equal, not, some],
}

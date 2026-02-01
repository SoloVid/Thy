import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import type { GeneratorForNameSpec } from "../../generator-for-name.ts"
import { contextType } from "code-gen/ts/generator-context.ts"
import { autoTight } from "../../utils/auto-tight.ts"
import { addErrorForExcessArgs } from "./too-many-args-error.ts"

export function makeLogicalFunctionGenerator(
  name: string,
  jsOperator: string,
): GeneratorForNameSpec {
  return {
    name: name,
    generateCall(node, state, fixture) {
      if (node.args.length === 0) {
        return
      }
      addErrorForExcessArgs(node, state, name, 4)
      const childState = state.makeChild({
        context: contextType.looseExpression,
      })
      const generatedChildren = node.args.map((a) =>
        fixture.generate(a, childState)
      )
      const separatedChildren = generatedChildren.map((c, i) => {
        if (i === 0) {
          return c
        }
        return [fromNode(node.func, ` ${jsOperator} `), c]
      })
      return fromComplicated(node, autoTight(state, separatedChildren))
    },
  }
}

export function makeSequencedLogicalFunctionGenerator(
  name: string,
  jsOperator: string,
): GeneratorForNameSpec {
  return {
    name: name,
    generateCall(node, state, fixture) {
      if (node.args.length < 2) {
        return
      }
      addErrorForExcessArgs(node, state, name, 4)
      const childState = state.makeChild({
        context: contextType.looseExpression,
      })
      const pairedOff = node.args.slice(1).map((b, i) => {
        const a = node.args[i]
        const innerParts = [
          fixture.generate(a, childState),
          ` ${jsOperator} `,
          fixture.generate(b, childState),
        ]
        return fromComplicated(
          node,
          node.args.length > 2 ? ["(", ...innerParts, ")"] : innerParts,
        )
      })
      const separatedPairs = pairedOff.map((p, i) => {
        if (i === 0) {
          return p
        }
        return [fromNode(node.func, ` && `), p]
      })
      return fromComplicated(node, autoTight(state, separatedPairs))
    },
  }
}

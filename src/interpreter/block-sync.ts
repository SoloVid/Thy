import type { Block } from "tree"
import assert from "utils/assert"
import type { BlockOptions } from "./block"
import { throwTransformedError } from "./block-error-transformer"
import { makeHelper } from "./block-helper"
import type { RuntimeValue } from "./dynamic-type"

export function interpretThySyncBlock(
  functionName: string,
  block: Block,
  options: BlockOptions,
) {
  const objWithBlockFunction: {
    [functionName: string]: (
      ...args: readonly RuntimeValue[]
    ) => RuntimeValue | undefined
  } = {
    [functionName]: (...args) => {
      const helper = makeHelper(block, options, args)
      try {
        for (const idea of block.ideas) {
          const statementResult = helper.evaluateStatement(idea)
          assert(
            !statementResult.wait,
            "It should be impossible for await to come up in non-async block",
          )
          const [shouldReturn, value] = statementResult.value
          if (shouldReturn) {
            return value
          }
        }
      } catch (e) {
        throwTransformedError(
          e,
          functionName,
          options.sourceFile,
          helper.additionalTraceLinesToHide,
        )
      }
      return helper.formulateResult()
    },
  }
  return {
    interpreted: objWithBlockFunction[functionName],
  }
}

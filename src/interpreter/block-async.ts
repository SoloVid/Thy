import type { Block } from "tree"
import type { BlockOptions } from "./block-options"
import { throwTransformedError } from "./block-error-transformer"
import { makeHelper } from "./block-helper"
import { forgetThisRuntimeFunctionIsAsync, type RuntimeFunction, type RuntimeFunctionAsync, type RuntimeValue } from "./dynamic-type"

export function interpretThyAsyncBlock(
  functionName: string,
  block: Block,
  options: BlockOptions,
) {
  const objWithBlockFunction: {
    [functionName: string]: RuntimeFunctionAsync
  } = {
    [functionName]: async (...args) => {
      // Note: I moved this up out of the loop. Not sure if that is going to break stuff.
      // For async stack traces, the trace is a bit different before and after a true await.
      const errorHere = new Error()

      const helper = makeHelper(block, options, args)
      for (const idea of block.ideas) {
        try {
          const statementResult = helper.evaluateStatement(idea)
          const [shouldReturn, value] = statementResult.wait
            ? await statementResult.promise
            : statementResult.value
          if (shouldReturn) {
            return value
          }
        } catch (e) {
          throwTransformedError(
            e,
            functionName,
            options.stackTracePath,
            helper.additionalTraceLinesToHide,
            errorHere,
          )
        }
      }

      return helper.formulateResult()
    },
  }
  return forgetThisRuntimeFunctionIsAsync(objWithBlockFunction[functionName])
}

import { nodeError } from "common/compile-error"
import type { Call, TypeCall } from "tree"
import type { GeneratorState } from "../../generator-state"

export function addErrorForExcessArgs(
  call: Call | TypeCall,
  state: GeneratorState,
  functionName: string,
  maxArgs: number,
  maxTypeArgs: number = 0,
) {
  if (call.type !== "type-call") {
    for (const arg of call.typeArgs.slice(maxTypeArgs)) {
      state.addError(
        nodeError(
          arg,
          `${functionName} cannot take more than ${maxTypeArgs} type argument${maxTypeArgs === 1 ? `` : `s`}`,
        ),
      )
    }
  }
  for (const arg of call.args.slice(maxArgs)) {
    state.addError(
      nodeError(
        arg,
        `${functionName} cannot take more than ${maxArgs} argument${maxArgs === 1 ? `` : `s`}`,
      ),
    )
  }
}

import {
  dissectErrorTraceAtCloserBaseline,
  replaceErrorTraceLine,
  transformErrorTrace,
} from "utils/error-helper"
import { InterpreterErrorWithContext } from "./interpreter-error"

export function throwTransformedError(
  errorCloseToCall: unknown,
  functionName: string,
  sourceFile: string,
  additionalTraceLinesToHide: number,
  altErrorHere?: Error,
) {
  if (errorCloseToCall instanceof InterpreterErrorWithContext) {
    if (!(errorCloseToCall.cause instanceof Error)) {
      throw errorCloseToCall.cause
    }
    const e = errorCloseToCall.cause

    const errorHere = new Error()
    const errorDissectedAtCall = dissectErrorTraceAtCloserBaseline(
      e,
      errorCloseToCall,
      errorCloseToCall.additionalDepthToShave,
      errorCloseToCall.altCloseError,
      errorCloseToCall.altAdditionalDepthToShave,
    )
    // console.log("errorDissectedAtCall", errorDissectedAtCall)
    const errorDissectedHere = dissectErrorTraceAtCloserBaseline(
      e,
      errorHere,
      additionalTraceLinesToHide,
      altErrorHere,
      additionalTraceLinesToHide,
    )
    // console.log("errorDissectedHere", errorDissectedHere)
    const errorTraceLocation = errorCloseToCall.sourceLocation

    throw transformErrorTrace(e, () => {
      return [
        errorDissectedAtCall.delta,
        replaceErrorTraceLine(errorDissectedHere.pivot, 0, () => [
          functionName,
          sourceFile,
          errorTraceLocation.line + 1,
          errorTraceLocation.column + 1,
        ]),
        errorDissectedHere.shared,
      ].join("\n")
    })
  }
  throw errorCloseToCall
}

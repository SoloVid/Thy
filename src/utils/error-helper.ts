import assert from "./assert"

const v8TraceLinePattern = /^(\s+at )([^ ]*)( \()?(.+?)(?::(\d+):(\d+))?(\)?)$/
const firefoxTraceLinePattern = /^(\s*)([^@]*)(@)(.+?)(?::(\d+):(\d+))?()$/

// TODO: Configure this elsewhere?
Error.stackTraceLimit = 100

export function getErrorTraceLinesFromStack(stack: string): string {
  return stack.split("\n").filter(l => v8TraceLinePattern.test(l) || firefoxTraceLinePattern.test(l)).join("\n")
}

export function getErrorTraceLines(error: Error): string {
  assert(!!error.stack, "Every Error object should have a stack property")
  const indexOfMessage = error.stack.indexOf(error.message)
  return getErrorTraceLinesFromStack(indexOfMessage >= 0 ? error.stack.substring(indexOfMessage + error.message.length) : error.stack)
}

class TransformedError extends Error {
  readonly cause: Error
  readonly stack: string

  constructor(error: Error, transform: (originalTraceLines: string) => string) {
    super(error.message)
    assert(!!error.stack, "Every Error object should have a stack property")
    this.cause = error instanceof TransformedError ? error.cause : error
    const originalTraceLines = getErrorTraceLines(error)
    const newTraceLines = transform(originalTraceLines)
    const indexOfTraceLines = error.stack.lastIndexOf(originalTraceLines)
    if (indexOfTraceLines < 0) {
      // I ran into a scenario where some trace lines got filtered out
      // because I didn't know they could happen.
      // Unfortunately, this made the match here fail.
      this.stack = error.stack
    } else {
      this.stack = error.stack.substring(0, indexOfTraceLines) + newTraceLines
    }
  }
}

export function transformErrorTrace(error: Error, transform: (originalTraceLines: string) => string): Error {
  return new TransformedError(error, transform)
}

export function dissectErrorTraceAtBaseline(error: Error, baselineError: Error, additionalOffsetFromBaseline: number = 0) {
  const traceLines = getErrorTraceLines(error).split("\n")
  const baselineTraceLines = getErrorTraceLines(baselineError).split("\n")
  const matchCalculations = baselineTraceLines.reduceRight((soFar, line, i) => {
    if (soFar.stopped) {
      return soFar
    }
    const compareIndex = traceLines.length - (baselineTraceLines.length - i)
    if (compareIndex < 0) {
      return soFar
    }
    const compareLine = traceLines[compareIndex]
    if (compareLine === line) {
      return {
        stopped: false,
        matches: soFar.matches + 1,
      }
    }
    return {
      stopped: true,
      matches: soFar.matches,
    }
  }, {
    stopped: false,
    matches: 0,
  })
  const baselineTraceLineCount = matchCalculations.matches + 1 + additionalOffsetFromBaseline
  // const baselineTraceLineCount = baselineTraceLines.length
  return {
    delta: traceLines.slice(0, -baselineTraceLineCount).join("\n"),
    pivot: traceLines[traceLines.length - baselineTraceLineCount],
    shared: traceLines.slice(-baselineTraceLineCount + 1).join("\n"),
  }
}

export function dissectErrorTraceAtCloserBaseline(
  error: Error,
  baselineError1: Error,
  additionalOffsetFromBaseline1: number,
  baselineError2: Error | undefined,
  additionalOffsetFromBaseline2: number,
) {
  const errorDissectedHere = dissectErrorTraceAtBaseline(error, baselineError1, additionalOffsetFromBaseline1)
  // console.log(errorDissectedHere)
  if (baselineError2) {
    // console.log("==trace alt here==\n", getErrorTraceLines(baselineError2))
    const altErrorDissectedHere = dissectErrorTraceAtBaseline(error, baselineError2, additionalOffsetFromBaseline2)
    if (altErrorDissectedHere.shared.split("\n").length > errorDissectedHere.shared.split("\n").length) {
      // console.log("choosing alt error here instead because better match")
      return altErrorDissectedHere
    }
  }
  return errorDissectedHere
}

export function replaceErrorTraceLine(traceLines: string, lineIndex: number, transform: (functionName: string, file: string, line: number, column: number) => [functionName: string, file: string, line: number, column: number]) {
  return traceLines.split("\n").map((l, i) => {
    if (i !== lineIndex) {
      return l
    }
    const pattern = firefoxTraceLinePattern.test(l) ? firefoxTraceLinePattern : v8TraceLinePattern
    if (pattern.test(l)) {
      return l.replace(pattern, (m, prefix1, func, prefix2, file, line, column, postfix) => {
        const [newFunc, newFile, newLine, newColumn] = transform(func, file, parseInt(line), parseInt(column))
        return `${prefix1}${newFunc}${prefix2}${newFile}:${newLine}:${newColumn}${postfix}`
      })
    }
    return l
  }).join("\n")
}

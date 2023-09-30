import assert from "./assert"

const v8TraceLinePattern = /^(\s+at (.+) \()(.+):(\d+):(\d+)(\))$/
const firefoxTraceLinePattern = /^((.*)@)(.+):(\d+):(\d+)()$/

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
    this.stack = error.stack.substring(0, indexOfTraceLines) + newTraceLines
  }
}

export function transformErrorTrace(error: Error, transform: (originalTraceLines: string) => string): Error {
  return new TransformedError(error, transform)
}

export function dissectErrorTraceAtBaseline(error: Error, baselineError: Error) {
  const traceLines = getErrorTraceLines(error).split("\n")
  const baselineTraceLines = getErrorTraceLines(baselineError).split("\n")
  const baselineTraceLineCount = baselineTraceLines.length
  return {
    delta: traceLines.slice(0, -baselineTraceLineCount).join("\n"),
    pivot: traceLines[traceLines.length - baselineTraceLineCount],
    shared: traceLines.slice(-baselineTraceLineCount + 1).join("\n"),
  }
}

export function replaceErrorTraceLine(traceLines: string, lineIndex: number, transform: (file: string, line: number, column: number) => [file: string, line: number, column: number]) {
  return traceLines.split("\n").map((l, i) => {
    if (i !== lineIndex) {
      return l
    }
    const pattern = firefoxTraceLinePattern.test(l) ? firefoxTraceLinePattern : v8TraceLinePattern
    if (pattern.test(l)) {
      return l.replace(pattern, (m, prefix, func, file, line, column, postfix) => {
        const [newFile, newLine, newColumn] = transform(file, parseInt(line), parseInt(column))
        return `${prefix}${newFile}:${newLine}:${newColumn}${postfix}`
      })
    }
    return l
  }).join("\n")
}

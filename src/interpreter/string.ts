import assert from "../utils/assert"
import { interpretThyIdentifier } from "./expression"
import type { MultilineString, ThyBlockContext } from "./types"

type InterpretMultilineStringState = {
  readonly newlinesBuiltUp: number
  readonly output: string
}

export function interpretThyMultilineString(input: MultilineString): string {
  return input.lines
    .map(l => {
      if (l.length < input.indent.length) {
        return ""
      }
      if (l.startsWith(input.indent)) {
        return l.substring(input.indent.length)
      }
      return l
    })
    .reduce((soFar, line) => {
      if (line === "") {
        return {
          ...soFar,
          newlinesBuiltUp: soFar.newlinesBuiltUp + 1,
        }
      }
      return {
        ...soFar,
        output: soFar.output + makeNewlines(soFar.newlinesBuiltUp) + line,
        newlinesBuiltUp: 1,
      }
    }, {
      newlinesBuiltUp: 0,
      output: "",
    } as InterpretMultilineStringState)
    .output
}

function makeNewlines(count: number): string {
  let output = ""
  for (let i = 0; i < count; i++) {
    output = output + "\n"
  }
  return output
}

export function interpolateString(context: ThyBlockContext, thyString: string): string {
  return thyString.replace(/\.([a-z][a-zA-Z0-9]*)\./g, (m, p1) => {
    const value = interpretThyIdentifier(context, p1)
    assert(typeof value === "string" || typeof value === "number", `${p1} is not a string or number`)
    return `${value}`
  })
}

import { makeInterpreterError } from "./call"
import { interpretThyIdentifier } from "./expression"
import { generateUID } from "./split-line"
import type { AtomSingle, ThyBlockContext } from "./types"

type InterpretMultilineStringState = {
  readonly newlinesBuiltUp: number
  readonly output: string
}

export type RawMultilineStringData = {
  indent: string
  lines: readonly string[]
  lineIndex: number
  columnIndex: number
}

export function interpretThyMultilineString(input: Pick<RawMultilineStringData, "indent" | "lines">): string {
  return `"` + input.lines
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
    .replaceAll(`"`, `\\"`) + `"`
}

function makeNewlines(count: number): string {
  let output = ""
  for (let i = 0; i < count; i++) {
    output = output + "\\n"
  }
  return output
}

export function interpolateString(context: ThyBlockContext, thyString: string, atom: AtomSingle): string {
  const slashUid = generateUID()
  const uid = generateUID()
  return thyString.replace(/\\\\/g, slashUid).replace(/\\\./g, uid).replace(/\.([a-z][a-zA-Z0-9]*)\./g, (m, p1) => {
    const value = interpretThyIdentifier(context, { ...atom, text: p1 }).target
    if (!(typeof value === "string") && !(typeof value === "number")) {
      throw makeInterpreterError(atom, `${p1} is not a string or number`)
    }
    return `${value}`
  }).replaceAll(uid, ".").replaceAll(slashUid, "\\\\")
}

export function parseString(stringLiteral: string, atom: AtomSingle): string {
  const m = /^"(.+)"$/.exec(stringLiteral)
  if (m === null) {
    throw makeInterpreterError(atom, `Invalid string literal: ${stringLiteral}`)
  }
  return m[1].replace(/\\./g, (m) => {
    if (m === `\\.`) {
      return m
    }
    return JSON.parse(`"${m}"`)
  })
}

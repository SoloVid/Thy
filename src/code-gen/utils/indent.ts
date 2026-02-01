import type { UnmappedGeneratedWhitespace } from "../generator.ts"

const indentSize = 2

export function indentString(input: string, howManyIndents: number): string {
  const lines = input.split("\n")
  const indent = makeIndent(howManyIndents)
  return lines.map((s) => indent + s).join("\n")
}

export function genIndent(indentLevel: number): UnmappedGeneratedWhitespace {
  return {
    text: makeIndent(indentLevel),
  }
}

export function makeIndent(indentLevel: number): string {
  return " ".repeat(indentLevel * indentSize)
}

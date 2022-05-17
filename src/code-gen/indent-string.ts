import type { UnmappedGeneratedWhitespace } from "./generator"

const indentSize = 2

export function indentString(input: string, howManyIndents: number): string {
    const lines = input.split("\n")
    const indent = " ".repeat(howManyIndents * indentSize)
    return lines.map(s => indent + s).join('\n')
}

export function makeIndent(indentLevel: number): string {
    return " ".repeat(indentLevel * indentSize)
}

export function genIndent(indentLevel: number): UnmappedGeneratedWhitespace {
    return {
        text: " ".repeat(indentLevel * indentSize)
    }
}

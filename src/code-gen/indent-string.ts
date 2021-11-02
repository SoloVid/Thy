
export function indentString(input: string, howManyIndents: number): string {
    const lines = input.split("\n")
    const indent = " ".repeat(howManyIndents * 2)
    return lines.map(s => indent + s).join('\n')
}

export function makeIndent(indentLevel: number): string {
    const indentSize = 2
    return " ".repeat(indentLevel * indentSize)
}

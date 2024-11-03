import type {
  GeneratedSnippet,
  GeneratedSnippets,
  UnmappedGeneratedWhitespace,
} from "../generator"

const indentSize = 2

export function indentString(input: string, howManyIndents: number): string {
  const lines = input.split("\n")
  const indent = makeIndent(howManyIndents)
  return lines.map((s) => indent + s).join("\n")
}

export function indentSnippets(
  input: readonly GeneratedSnippet[],
  howManyIndents: number,
): GeneratedSnippets {
  const indent = genIndent(howManyIndents)
  // Always put an indent at the beginning.
  const newSnippets: GeneratedSnippet[] = [indent]
  for (const snippet of input) {
    const lines = snippet.text.split("\n")
    // If the snippet is not multiline, we don't need to inject an indent.
    if (lines.length === 1) {
      newSnippets.push(snippet)
    } else {
      // Split the snippet into pairs of lines and indents.
      for (const line of lines) {
        newSnippets.push({
          ...input,
          text: `${line}\n`,
        })
        newSnippets.push(indent)
      }
    }
  }
  // The last snippet is probably an indent, which we don't actually want,
  // so remove it now.
  const last = newSnippets.pop()
  if (last !== indent) {
    newSnippets.push(indent)
  }
  return newSnippets
}

export function genIndent(indentLevel: number): UnmappedGeneratedWhitespace {
  return {
    text: makeIndent(indentLevel),
  }
}

export function makeIndent(indentLevel: number): string {
  return " ".repeat(indentLevel * indentSize)
}

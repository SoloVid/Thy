import assert from "assert"

export function extractIndent(line: string): string {
  const m = /^( *)/.exec(line)
  assert(m !== null, "Indent regex should be able to match any line but did not")
  return m[1]
}

export function getFirstIndent(thySourceLines: readonly string[]): string {
  for (const line of thySourceLines) {
    if (line.trim() !== "") {
      return extractIndent(line)
    }
  }
  throw new Error(`Cannot detect indentation when there are no non-empty lines`)
}

import { randomUUID } from "node:crypto"
import { stringRegex } from "./patterns"

export function splitLineParts(line: string): readonly string[] {
  const substitutions: Record<string, string> = {}
  return line
    .trim()
    .replace(new RegExp(stringRegex, "g"), (match) => {
      const id = randomUUID()
      substitutions[id] = match
      return id
    })
    .split(" ")
    .map(p => p in substitutions ? substitutions[p] : p)
}

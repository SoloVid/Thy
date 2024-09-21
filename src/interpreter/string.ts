import type { StringLiteral } from "tree/string"
import { interpretThyValueIdentifier } from "./expression"
import { makeInterpreterNodeError } from "./interpreter-error"
import type { ThyBlockContext } from "./types"

export function interpretThyString(
  context: ThyBlockContext,
  input: StringLiteral,
): string {
  return input.parts.reduce((soFar, part) => {
    if (part.type === "string-content") {
      return (
        soFar +
        JSON.parse(
          `"${part.token.text.replace(/\n/g, "\\n").replace(/\\\./g, ".")}"`,
        )
      )
    }
    // console.log(context)
    const value = interpretThyValueIdentifier(context, part.value).value.target
    // console.log(part)
    if (!(typeof value === "string") && !(typeof value === "number")) {
      throw makeInterpreterNodeError(
        part.value,
        `${part.value.token.text} is not a string or number`,
      )
    }
    return `${soFar}${value}`
  }, "")
}

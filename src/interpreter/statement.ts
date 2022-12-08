import { interpretThyCall } from "./call"
import type { Atom, ThyBlockContext } from "./types"

export function interpretThyStatement(context: ThyBlockContext, parts: readonly Atom[]): void {
  // if (Array.isArray(thyExpression)) {
  //   interpretThyBlockLines(thyExpression)()
  // }
  // assert(typeof thyExpression === "string", "Array case should have been filtered")

  if (parts.length > 1 && parts[1] === "is") {
    context.variablesInBlock[parts[0]] = interpretThyCall(context, parts.slice(2))
    return
  }

  interpretThyCall(context, parts)
}

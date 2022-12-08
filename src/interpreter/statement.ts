import assert from "node:assert"
import { interpretThyCall } from "./call"
import { identifierRegex } from "./patterns"
import type { Atom, ThyBlockContext } from "./types"

export function interpretThyStatement(context: ThyBlockContext, parts: readonly Atom[]): void {
  const [variableName, assignKeyword, ...callParts] = parts

  if (typeof variableName === "string" && typeof assignKeyword === "string" && ["is", "be", "to"].includes(assignKeyword)) {
    assert.match(variableName, identifierRegex, `${variableName} is not a valid identifier. Variable names should begin with a lower-case letter and only contain letters and numbers.`)
    if (variableName in context.closure) {
      throw new Error(`${variableName} cannot be shadowed. Since it is declared in an upper scope, it cannot be redefined.`)
    }
    if (context.variableIsImmutable[variableName]) {
      throw new Error(`${variableName} is immutable and cannot be reassigned. Did you mean to use \`be\` instead of \`is\` at its definition?`)
    }
    if (variableName in context.variablesInBlock && assignKeyword !== "to") {
      throw new Error(`${variableName} is already defined. Did you mean to use \`to\` instead of \`${assignKeyword}\`?`)
    }
    if (assignKeyword === "is") {
      context.variableIsImmutable[variableName] = true
    }
    context.variablesInBlock[variableName] = interpretThyCall(context, callParts)
    return
  }

  interpretThyCall(context, parts)
}

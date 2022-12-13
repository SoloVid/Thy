import assert from "../utils/assert"
import { interpretThyCall } from "./call"
import { identifierRegex } from "./patterns"
import type { Atom, ThyBlockContext } from "./types"

export function interpretThyStatement(context: ThyBlockContext, parts: readonly Atom[]): void {
  const mutableParts = [...parts]
  const firstPart = mutableParts.shift()
  const isExport = firstPart === "export"
  const isPrivate = firstPart === "private"
  const variableName = (isExport || isPrivate) ? mutableParts.shift() : firstPart
  const [assignKeyword, ...callParts] = mutableParts

  if (typeof variableName === "string" && typeof assignKeyword === "string" && ["is", "be", "to"].includes(assignKeyword)) {
    const newValue = interpretThyCall(context, callParts)

    context.thatValue = undefined
    context.beforeThatValue = undefined

    assert(identifierRegex.test(variableName), `${variableName} is not a valid identifier. Variable names should begin with a lower-case letter and only contain letters and numbers.`)

    if (assignKeyword !== "to") {
      if (isExport) {
        context.exportedVariables.push(variableName)
      } else if (!isPrivate) {
        context.bareVariables.push(variableName)
      }
    }

    assert(!(variableName in context.implicitArguments), `${variableName} is an implicit argument and cannot be overwritten`)
    if (variableName in context.closure && ["is", "be"].includes(assignKeyword)) {
      throw new Error(`${variableName} cannot be shadowed. Since it is declared in an upper scope, it cannot be redefined.`)
    }
    if (context.variableIsImmutable[variableName] || context.closureVariableIsImmutable[variableName]) {
      throw new Error(`${variableName} is immutable and cannot be reassigned. Did you mean to use \`be\` instead of \`is\` at its definition?`)
    }
    if (variableName in context.variablesInBlock && assignKeyword !== "to") {
      throw new Error(`${variableName} is already defined. Did you mean to use \`to\` instead of \`${assignKeyword}\`?`)
    }
    if (variableName in context.closure) {
      context.closure[variableName] = newValue
      return
    }
    if (assignKeyword === "is") {
      context.variableIsImmutable[variableName] = true
    }
    context.variablesInBlock[variableName] = newValue
    return
  }

  const result = interpretThyCall(context, parts)
  context.beforeThatValue = context.thatValue
  context.thatValue = result
}

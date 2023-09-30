import assert from "../utils/assert"
import { interpretThyCall } from "./call"
import { interpretThyExpression } from "./expression"
import { identifierRegex } from "./patterns"
import { Atom, isAtomLiterally, isSimpleAtom, ThyBlockContext } from "./types"

export function interpretThyStatement(context: ThyBlockContext, parts: readonly Atom[]): void | PromiseLike<void> {
  const mutableParts = [...parts]
  const firstPart = mutableParts.shift()
  const isExport = isAtomLiterally(firstPart, "export")
  const isPrivate = isAtomLiterally(firstPart, "private")
  const variableNamePart = (isExport || isPrivate) ? mutableParts.shift() : firstPart
  const [assignKeywordPart, ...callParts] = mutableParts

  if (isSimpleAtom(variableNamePart) && isSimpleAtom(assignKeywordPart) && ["is", "be", "to"].includes(assignKeywordPart.text)) {
    const variableName = variableNamePart.text
    const assignKeyword = assignKeywordPart.text
    if (isAtomLiterally(callParts[0], "await")) {
      assert(callParts.length === 2, `\`await\` takes 1 argument; got ${callParts.length}`)
      return Promise.resolve(interpretThyExpression(context, callParts[1]).target).then(handleReturnedValue)
    }
  
    handleReturnedValue(interpretThyCall(context, callParts))
    return

    function handleReturnedValue(newValue: unknown) {
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
  }

  if (isAtomLiterally(parts[0], "await")) {
    assert(parts.length === 2, `\`await\` takes 1 argument; got ${parts.length}`)
    return Promise.resolve(interpretThyExpression(context, parts[1]).target).then((result) => {
      context.beforeThatValue = context.thatValue
      context.thatValue = result
    })
  }

  const result = interpretThyCall(context, parts)
  context.beforeThatValue = context.thatValue
  context.thatValue = result
}

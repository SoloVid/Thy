import { Assignment, isDeclaration } from "tree/assignment"
import { Call, isCall } from "tree/call"
import { isIdeaAsync } from "tree/idea"
import assert from "utils/assert"
import { interpretThyCall } from "./call"
import { interpretThyValuePropertyAccessExceptLeaf } from "./expression"
import {
  makeInterpreterNodeError
} from "./interpreter-error"
import { ThyBlockContext } from "./types"

export function interpretThyStatement(
  context: ThyBlockContext,
  idea: Call | Assignment,
): void | PromiseLike<void> {
  if (isIdeaAsync(idea)) {
    throw new Error("TODO: Implement async in interpreter")
  }

  if (isCall(idea)) {
    assert(idea.type !== "await-call", "It should be impossible for idea to be await-call here")
    interpretThyCall(context, idea)
    return
  }

  assert(idea.call.type !== "await-call", "It should be impossible for idea to be async here")
  const newValue = interpretThyCall(context, idea.call)

  if (idea.variable.type === "value-property-access") {
    const {base, lastAccess} = interpretThyValuePropertyAccessExceptLeaf(context, idea.variable)
    const baseAsRecord = (base as Record<string, unknown>)
    baseAsRecord[lastAccess] = newValue
    return
  }

  const variableName = idea.variable.token.text
  if (
    context.implicitArgumentFirstUsed !== null &&
    variableName in context.implicitArguments
  ) {
    throw makeInterpreterNodeError(
      idea.variable,
      `${variableName} is an implicit argument and cannot be overwritten`,
    )
  }
  if (
    variableName in context.closure &&
    isDeclaration(idea)
  ) {
    throw makeInterpreterNodeError(
      idea.variable,
      `${variableName} cannot be shadowed. Since it is declared in an upper scope, it cannot be redefined.`,
    )
  }
  if (variableName in context.closure) {
    context.closure[variableName] = newValue
    return
  }
  context.variablesInBlock[variableName] = newValue
}

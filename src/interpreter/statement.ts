import { Assignment, Call, isCall, isDeclaration } from "tree"
import { forwardWait, MayWait, notWait, yesWait } from "./async-helper"
import { interpretThyCall } from "./call"
import { RuntimeObject, yesIThinkThisIsRuntimeObject } from "./dynamic-type"
import { interpretThyValuePropertyAccessExceptLeaf } from "./expression"
import { makeInterpreterNodeError } from "./interpreter-error"
import type { ThyBlockContext } from "./types"

export function interpretThyStatement(
  context: ThyBlockContext,
  idea: Call | Assignment,
): MayWait<void> {
  if (isCall(idea)) {
    return forwardWait(interpretThyCall(context, idea), () => undefined)
  }

  const assignmentDetailsResult = getAssignmentDetails(context, idea)
  if (assignmentDetailsResult.wait) {
    return yesWait(async () => {
      return interpretThyAssignmentAsync(
        context,
        idea,
        await assignmentDetailsResult.promise,
      )
    })
  }
  const assignmentDetails = assignmentDetailsResult.value
  const callResult = interpretThyCall(context, idea.call)
  return forwardWait(callResult, (newValue) => {
    if (assignmentDetails) {
      assignmentDetails.variableMap[assignmentDetails.variableName] = newValue
    }
  })
}

async function interpretThyAssignmentAsync(
  context: ThyBlockContext,
  idea: Assignment,
  assignmentDetails: AssignmentDetails,
) {
  const callResult = interpretThyCall(context, idea.call)
  const newValue = callResult.wait ? await callResult.promise : callResult.value
  if (assignmentDetails) {
    assignmentDetails.variableMap[assignmentDetails.variableName] = newValue
  }
}

type AssignmentDetails = {
  variableMap: RuntimeObject
  variableName: string
} | null

function getAssignmentDetails(
  context: ThyBlockContext,
  idea: Call | Assignment,
): MayWait<AssignmentDetails> {
  if (isCall(idea)) {
    return notWait(null)
  }
  if (idea.variable.type === "value-property-access") {
    const accessResult = interpretThyValuePropertyAccessExceptLeaf(
      context,
      idea.variable,
    )
    return forwardWait(accessResult, ({ base, lastAccess }) => ({
      variableMap: yesIThinkThisIsRuntimeObject(base),
      variableName: lastAccess,
    }))
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
  if (variableName in context.closure && isDeclaration(idea)) {
    throw makeInterpreterNodeError(
      idea.variable,
      `${variableName} cannot be shadowed. Since it is declared in an upper scope, it cannot be redefined.`,
    )
  }
  if (variableName in context.closure) {
    return notWait({ variableMap: context.closure, variableName })
  }
  return notWait({ variableMap: context.variablesInBlock, variableName })
}

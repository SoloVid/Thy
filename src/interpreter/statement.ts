import { interpretThyCall } from "./call"
import { interpretThyExpression } from "./expression"
import { InterpreterErrorWithContext, makeInterpreterError } from "./interpreter-error"
import { identifierRegex } from "./patterns"
import { Atom, isAtomLiterally, isSimpleAtom, ThyBlockContext } from "./types"

export function parseThyStatement(parts: readonly Atom[]) {
  const mutableParts = [...parts]
  const firstPart = mutableParts.shift()
  const varModifierPart = (isAtomLiterally(firstPart, "export") || isAtomLiterally(firstPart, "private")) ? firstPart : undefined
  const variableNamePart = !!varModifierPart ? mutableParts.shift() : firstPart
  const [assignKeywordPart, ...callParts] = mutableParts

  if (isSimpleAtom(variableNamePart) && isSimpleAtom(assignKeywordPart) && ["is", "be", "to"].includes(assignKeywordPart.text)) {
    return {
      assignment: {
        varModifierPart: varModifierPart,
        varPart: variableNamePart,
        assignPart: assignKeywordPart,
      },
      call: {
        parts: callParts,
      },
    }
  }
  return {
    call: {
      parts: parts,
    },
  }
}

export function interpretThyStatement(context: ThyBlockContext, parts: readonly Atom[]): void | PromiseLike<void> {
  const parsed = parseThyStatement(parts)
  const callParts = parsed.call.parts

  const handleReturnedValue = getReturnHandler()

  if (isAtomLiterally(callParts[0], "await")) {
    assertAwaitCallParts(callParts)
    return doAwaitStuff(callParts[0], callParts[1]).then(handleReturnedValue)
  }

  handleReturnedValue(interpretThyCall(context, callParts))
  return

  function getReturnHandler() {
    if (parsed.assignment) {
      const varModifierPart = parsed.assignment.varModifierPart
      const definedVariableNamePart = parsed.assignment.varPart
      const variableName = parsed.assignment.varPart.text
      const assignKeyword = parsed.assignment.assignPart.text
      
      return function handleReturnedValueAssign(newValue: unknown) {
        context.thatValue = undefined
        context.beforeThatValue = undefined
  
        if (!identifierRegex.test(variableName)) {
          throw makeInterpreterError(definedVariableNamePart, `${variableName} is not a valid identifier. Variable names should begin with a lower-case letter and only contain letters and numbers.`)
        }
  
        if (assignKeyword !== "to") {
          if (isAtomLiterally(varModifierPart, "export")) {
            context.exportedVariables.push(variableName)
          } else if (!isAtomLiterally(varModifierPart, "private")) {
            context.bareVariables.push(variableName)
          }
        }
  
        if (variableName in context.implicitArguments) {
          throw makeInterpreterError(definedVariableNamePart, `${variableName} is an implicit argument and cannot be overwritten`)
        }
        if (variableName in context.closure && ["is", "be"].includes(assignKeyword)) {
          throw makeInterpreterError(definedVariableNamePart, `${variableName} cannot be shadowed. Since it is declared in an upper scope, it cannot be redefined.`)
        }
        if (context.variableIsImmutable[variableName] || context.closureVariableIsImmutable[variableName]) {
          throw makeInterpreterError(definedVariableNamePart, `${variableName} is immutable and cannot be reassigned. Did you mean to use \`be\` instead of \`is\` at its definition?`)
        }
        if (variableName in context.variablesInBlock && assignKeyword !== "to") {
          throw makeInterpreterError(definedVariableNamePart, `${variableName} is already defined. Did you mean to use \`to\` instead of \`${assignKeyword}\`?`)
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

    return function handleReturnedValueNoAssign(newValue: unknown) {
      context.beforeThatValue = context.thatValue
      context.thatValue = newValue
    }
  }

  function doAwaitStuff(awaitAtom: Atom, expressionAtom: Atom) {
    return (async () => {
      // For async stack traces, the trace is a bit different before and after a true await.
      const errorHere = new Error("errorHere")
      try {
        const result = await interpretThyExpression(context, expressionAtom).target
        context.beforeThatValue = context.thatValue
        context.thatValue = result
        return result
      } catch (e) {
        throw new InterpreterErrorWithContext(e, awaitAtom, 0, errorHere, 1)
      }
    })()
  }
}

function assertAwaitCallParts(callParts: readonly Atom[]) {
  if (callParts.length !== 2) {
    throw makeInterpreterError(callParts[0], `\`await\` takes 1 argument; got ${callParts.length}`)
  }
}

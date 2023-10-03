import { InterpreterErrorWithContext, interpretThyCall, makeInterpreterError } from "./call"
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
    const definedVariableNamePart = variableNamePart
    const variableName = variableNamePart.text
    const assignKeyword = assignKeywordPart.text
    if (isAtomLiterally(callParts[0], "await")) {
      assertAwaitCallParts(callParts)
      return doAwaitStuff(callParts[0], callParts[1]).then(handleReturnedValue)
    }
  
    handleReturnedValue(interpretThyCall(context, callParts))
    return

    function handleReturnedValue(newValue: unknown) {
      context.thatValue = undefined
      context.beforeThatValue = undefined

      if (!identifierRegex.test(variableName)) {
        throw makeInterpreterError(definedVariableNamePart, `${variableName} is not a valid identifier. Variable names should begin with a lower-case letter and only contain letters and numbers.`)
      }

      if (assignKeyword !== "to") {
        if (isExport) {
          context.exportedVariables.push(variableName)
        } else if (!isPrivate) {
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

  if (isAtomLiterally(parts[0], "await")) {
    assertAwaitCallParts(parts)
    return doAwaitStuff(parts[0], parts[1]).then((result) => {
      context.beforeThatValue = context.thatValue
      context.thatValue = result
    })
  }

  const result = interpretThyCall(context, parts)
  context.beforeThatValue = context.thatValue
  context.thatValue = result
}

function assertAwaitCallParts(callParts: readonly Atom[]) {
  if (callParts.length !== 2) {
    throw makeInterpreterError(callParts[0], `\`await\` takes 1 argument; got ${callParts.length}`)
  }
}

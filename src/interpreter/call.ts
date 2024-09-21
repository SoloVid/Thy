import { getFirstToken } from "parser/helper"
import { GivenCall, ValueCall } from "tree"
import { interpretThyExpression } from "./expression"
import {
  InterpreterErrorWithContext,
  makeInterpreterNodeError,
} from "./interpreter-error"
import { ThyBlockContext } from "./types"

export function interpretThyCall(
  context: ThyBlockContext,
  call: GivenCall | ValueCall,
): unknown {
  if (call.type === "given-call") {
    if (context.implicitArgumentFirstUsed !== null) {
      throw makeInterpreterNodeError(
        call.func,
        `\`given\` cannot be used after implicit arguments are used. (${context.implicitArgumentFirstUsed} referenced implicit argument.)`,
      )
    }
    context.givenUsed = true
    if (call.args.length === 1) {
      const defaultValue = interpretThyExpression(
        context,
        call.args[0],
      ).target
      if (context.argsToUse.length === 0) {
        return defaultValue
      }
    }
    if (context.argsToUse.length <= 0) {
      throw makeInterpreterNodeError(
        call.func,
        `No argument or default available for given`,
      )
    }
    return context.argsToUse.shift()
  }

  const callArgs = call.args.map(
    (a) => interpretThyExpression(context, a).target,
  )
  const ie = interpretThyExpression(context, call.func)
  const f = ie.target as (...args: readonly unknown[]) => unknown
  const functionName = call.funcToken?.text ?? "<anonymous>"
  if (!(typeof f === "function")) {
    throw makeInterpreterNodeError(
      call.func,
      `${functionName} is not a function: ${JSON.stringify(f)}`,
    )
  }
  try {
    if (ie.thisValue !== undefined) {
      return f.call(ie.thisValue, ...callArgs)
    }
    return f(...callArgs)
  } catch (e) {
    throw new InterpreterErrorWithContext(e, getFirstToken(call.func))
  }
}

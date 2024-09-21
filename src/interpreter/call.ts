import { getFirstToken } from "parser/helper"
import { AwaitCall, Call, GivenCall, TreeNode, ValueCall } from "tree"
import { InterpretedExpression, interpretThyExpression } from "./expression"
import {
  InterpreterErrorWithContext,
  makeInterpreterNodeError,
} from "./interpreter-error"
import { ThyBlockContext } from "./types"
import { forwardWait, MayWait, notWait, yesWait, YesWait } from "./async-helper"
import {
  RuntimeFunction,
  RuntimeValue,
  yesIThinkThisIsRuntimeFunction,
} from "./dynamic-type"

export function interpretThyCall(
  context: ThyBlockContext,
  call: Call,
): MayWait<RuntimeValue> {
  if (call.type === "await-call") {
    return interpretThyAwaitCall(context, call)
  }
  if (call.type === "given-call") {
    return interpretThyGivenCall(context, call)
  }

  const fr = interpretThyExpression(context, call.func)

  if (fr.wait) {
    return yesWait(async () => {
      return interpretThyValueCallAsync(context, call, await fr.promise)
    })
  }

  const ie = fr.value
  const f = yesIThinkThisIsRuntimeFunction(ie.target)

  const callArgs: RuntimeValue[] = []
  for (const arg of call.args) {
    const ir = interpretThyExpression(context, arg)
    if (ir.wait) {
      return yesWait(async () => {
        const value = await ir.promise
        callArgs.push(value.target)
        return interpretThyValueCallAsync(context, call, ie, callArgs)
      })
    }
    callArgs.push(ir.value.target)
  }

  const functionName = call.funcToken?.text ?? "<anonymous>"
  checkFunction(functionName, f, call.func)
  try {
    if (ie.thisValue !== undefined) {
      return notWait(f.call(ie.thisValue, ...callArgs))
    }
    return notWait(f(...callArgs))
  } catch (e) {
    throw new InterpreterErrorWithContext(e, getFirstToken(call.func))
  }
}

function interpretThyGivenCall(
  context: ThyBlockContext,
  call: GivenCall,
): MayWait<RuntimeValue> {
  if (context.implicitArgumentFirstUsed !== null) {
    throw makeInterpreterNodeError(
      call.func,
      `\`given\` cannot be used after implicit arguments are used. (${context.implicitArgumentFirstUsed} referenced implicit argument.)`,
    )
  }
  context.givenUsed = true
  if (call.args.length === 1) {
    const eResult = interpretThyExpression(context, call.args[0])
    if (context.argsToUse.length === 0) {
      return forwardWait(eResult, (e) => e.target)
    }
  }
  const nextArg = context.argsToUse.shift()
  if (nextArg === undefined) {
    throw makeInterpreterNodeError(
      call.func,
      `No argument or default available for given`,
    )
  }
  return notWait(nextArg)
}

function interpretThyAwaitCall(
  context: ThyBlockContext,
  call: AwaitCall,
): YesWait<RuntimeValue> {
  return yesWait(async () => {
    const eResult = interpretThyExpression(context, call.args[0])
    const value = await Promise.resolve(
      eResult.wait ? eResult.promise : eResult.value,
    )
    return value.target
  })
}

function checkFunction(
  functionName: string,
  f: unknown,
  node: TreeNode,
): asserts f is Function {
  if (!(typeof f === "function")) {
    throw makeInterpreterNodeError(
      node,
      `${functionName} is not a function: ${JSON.stringify(f)}`,
    )
  }
}

export async function interpretThyValueCallAsync(
  context: ThyBlockContext,
  call: ValueCall,
  ie: InterpretedExpression,
  argsSoFar: readonly RuntimeValue[] = [],
): Promise<RuntimeValue> {
  const f = yesIThinkThisIsRuntimeFunction(ie.target)
  const functionName = call.funcToken?.text ?? "<anonymous>"
  if (!(typeof f === "function")) {
    throw makeInterpreterNodeError(
      call.func,
      `${functionName} is not a function: ${JSON.stringify(f)}`,
    )
  }

  const callArgs: RuntimeValue[] = [...argsSoFar]
  const remainingArgs = call.args.slice(argsSoFar?.length ?? 0)
  for (const arg of remainingArgs) {
    const callArgInterpResult = interpretThyExpression(context, arg)
    const value = callArgInterpResult.wait
      ? await callArgInterpResult.promise
      : callArgInterpResult.value
    callArgs.push(value.target)
  }

  checkFunction(functionName, f, call.func)
  try {
    if (ie.thisValue !== undefined) {
      return f.call(ie.thisValue, ...callArgs)
    }
    return f(...callArgs)
  } catch (e) {
    throw new InterpreterErrorWithContext(e, getFirstToken(call.func))
  }
}

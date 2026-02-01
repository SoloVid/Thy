import { getFirstToken } from "parser/helper.ts"
import type { AwaitCall, Call, GivenCall, TreeNode, ValueCall } from "tree"
import { ThyCall } from "tree/call.ts"
import {
  forwardWait,
  MayWait,
  NotWait,
  notWait,
  YesWait,
  yesWait,
} from "./async-helper.ts"
import {
  isVoid,
  RuntimeReturn,
  RuntimeValue,
  yesIThinkThisIsRuntimeFunction,
} from "./dynamic-type.ts"
import { InterpretedExpression, interpretThyExpression } from "./expression.ts"
import {
  InterpreterErrorWithContext,
  makeInterpreterNodeError,
} from "./interpreter-error.ts"
import type { ThyBlockContext } from "./types.ts"

export function interpretThyCall(
  context: ThyBlockContext,
  call: Call,
): MayWait<RuntimeReturn> {
  if (call.type === "await-call") {
    return interpretThyAwaitCall(context, call)
  }
  if (call.type === "given-call") {
    return interpretThyGivenCall(context, call)
  }
  if (call.type === "thy-call") {
    return interpretThyThyCall(context, call)
  }

  const fr = interpretThyExpression(context, call.func)

  if (fr.wait) {
    return yesWait(async () => {
      return interpretThyValueCallAsync(context, call, await fr.promise)
    })
  }

  const ie = fr.value
  if (isVoid(ie.target)) {
    throw makeInterpreterNodeError(
      call.func,
      `void cannot be called as a function`,
    )
  }
  const f = yesIThinkThisIsRuntimeFunction(ie.target)

  const callArgs: RuntimeValue[] = []
  for (const arg of call.args) {
    const ir = interpretThyExpression(context, arg)
    if (ir.wait) {
      return yesWait(async () => {
        const value = await ir.promise
        if (isVoid(value.target)) {
          throw makeInterpreterNodeError(arg, `Call argument cannot be void`)
        }
        callArgs.push(value.target)
        return interpretThyValueCallAsync(context, call, ie, callArgs)
      })
    }
    if (isVoid(ir.value.target)) {
      throw makeInterpreterNodeError(arg, `Call argument cannot be void`)
    }
    callArgs.push(ir.value.target)
  }

  const functionName = call.funcToken?.text ?? "<anonymous>"
  checkFunction(functionName, f, call.func)
  try {
    if (ie.thisValue !== undefined) {
      return notWait(f.call(ie.thisValue, ...callArgs) as RuntimeReturn)
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
    const defaultValueNode = call.args[0]
    const eResult = interpretThyExpression(context, defaultValueNode)
    if (context.argsToUse.length === 0) {
      return forwardWait(eResult, (e) => {
        if (isVoid(e.target)) {
          throw makeInterpreterNodeError(
            defaultValueNode,
            `void cannot be used as argument to "given"`,
          )
        }
        return e.target
      })
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
): YesWait<RuntimeReturn> {
  return yesWait(async () => {
    // For async stack traces, the trace is a bit different before and after a true await.
    const errorHere = new Error("error for stack in interpretThyAwaitCall()")
    try {
      const eResult = interpretThyExpression(context, call.args[0])
      const resolvedExpression = eResult.wait
        ? await eResult.promise
        : eResult.value
      const resolvedExpressionValue = resolvedExpression.target as
        | RuntimeValue
        | PromiseLike<RuntimeValue>
      const awaitedValue = await resolvedExpressionValue
      return awaitedValue
    } catch (e) {
      throw new InterpreterErrorWithContext(e, call.func.token, 0, errorHere, 2)
    }
  })
}

function interpretThyThyCall(
  context: ThyBlockContext,
  call: ThyCall,
): NotWait<RuntimeReturn> {
  const target = call.args[0].parts.map((p) => p.token.text).join("")
  const result = context.resolveThy(context.thyResolutionRelativePath, target)
  return notWait(result)
}

function checkFunction(
  functionName: string,
  f: unknown,
  node: TreeNode,
): asserts f is (...args: readonly unknown[]) => unknown {
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
): Promise<RuntimeReturn> {
  const functionName = call.funcToken?.text ?? "<anonymous>"
  if (isVoid(ie.target)) {
    throw makeInterpreterNodeError(
      call.func,
      `${functionName} is not a function but is void`,
    )
  }
  const f = yesIThinkThisIsRuntimeFunction(ie.target)
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
    if (isVoid(value.target)) {
      throw makeInterpreterNodeError(
        arg,
        `void cannot be used as call argument`,
      )
    }
    callArgs.push(value.target)
  }

  checkFunction(functionName, f, call.func)
  try {
    if (ie.thisValue !== undefined) {
      return f.call(ie.thisValue, ...callArgs) as RuntimeReturn
    }
    return f(...callArgs)
  } catch (e) {
    throw new InterpreterErrorWithContext(e, getFirstToken(call.func))
  }
}

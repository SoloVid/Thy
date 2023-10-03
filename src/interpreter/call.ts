import { interpretThyExpression } from "./expression"
import { Atom, AtomSingle, isAtomLiterally, isSimpleAtom, ThyBlockContext } from "./types"

export function interpretThyCall(context: ThyBlockContext, parts: readonly Atom[]): unknown {
  const [functionExpression, ...callArgExpressions] = parts

  if (isAtomLiterally(functionExpression, "given")) {
    if (context.implicitArgumentFirstUsed !== null) {
      throw makeInterpreterError(functionExpression, `\`given\` cannot be used after implicit arguments are used. (${context.implicitArgumentFirstUsed} referenced implicit argument.)`)
    }
    context.givenUsed = true
    if (callArgExpressions.length > 1) {
      throw makeInterpreterError(callArgExpressions[1], "given may only take one argument")
    }
    if (callArgExpressions.length === 1) {
      const defaultValue = interpretThyExpression(context, callArgExpressions[0]).target
      if (context.argsToUse.length === 0) {
        return defaultValue
      }
    }
    if (context.argsToUse.length <= 0) {
      throw makeInterpreterError(functionExpression, `No argument or default available for given`)
    }
    return context.argsToUse.shift()
  }

  const callArgs = callArgExpressions.map(a => interpretThyExpression(context, a).target)
  const ie = interpretThyExpression(context, functionExpression)
  const f = ie.target as (...args: readonly unknown[]) => unknown
  const functionName = isSimpleAtom(functionExpression) ? functionExpression.text : "<anonymous>"
  if (!(typeof f === "function")) {
    throw makeInterpreterError(functionExpression, `${functionName} is not a function: ${JSON.stringify(f)}`)
  }
  try {
    if (ie.thisValue !== undefined) {
      return f.call(ie.thisValue, ...callArgs)
    }
    return f(...callArgs)
  } catch (e) {
    throw new InterpreterErrorWithContext(e, functionExpression)
  }
}

export function makeInterpreterError(atom: Atom, message: string) {
  return new InterpreterErrorWithContext(new Error(message), atom)
}

export class InterpreterErrorWithContext extends Error {
  readonly cause: unknown
  readonly sourceLocation: { lineIndex: number, columnIndex: number }
  constructor(
    cause: unknown,
    atom: Atom,
    public readonly additionalDepthToShave: number = 0,
    public readonly altCloseError?: Error,
    public readonly altAdditionalDepthToShave: number = 0
  ) {
    super(cause instanceof Error ? cause.message : undefined)
    this.cause = cause
    this.sourceLocation = {
      lineIndex: atom.lineIndex,
      columnIndex: (atom as AtomSingle).columnIndex ?? 0,
    }
  }
}

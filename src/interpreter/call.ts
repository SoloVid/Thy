import assert from "../utils/assert"
import { interpretThyExpression } from "./expression"
import { Atom, AtomSingle, isAtomLiterally, isSimpleAtom, ThyBlockContext } from "./types"

export function interpretThyCall(context: ThyBlockContext, parts: readonly Atom[]): unknown {
  const [functionExpression, ...callArgExpressions] = parts

  if (isAtomLiterally(functionExpression, "given")) {
    if (context.implicitArgumentFirstUsed !== null) {
      throw new Error(`\`given\` cannot be used after implicit arguments are used. (${context.implicitArgumentFirstUsed} referenced implicit argument.)`)
    }
    context.givenUsed = true
    assert(callArgExpressions.length <= 1, "given may only take one argument")
    if (callArgExpressions.length === 1) {
      const defaultValue = interpretThyExpression(context, callArgExpressions[0]).target
      if (context.argsToUse.length === 0) {
        return defaultValue
      }
    }
    assert(context.argsToUse.length > 0, `No argument or default available for given`)
    return context.argsToUse.shift()
  }

  const callArgs = callArgExpressions.map(a => interpretThyExpression(context, a).target)
  const ie = interpretThyExpression(context, functionExpression)
  const f = ie.target as (...args: readonly unknown[]) => unknown
  const functionName = isSimpleAtom(functionExpression) ? functionExpression.text : "<anonymous>"
  assert(typeof f === "function", `${functionName} is not a function: ${JSON.stringify(f)}`)
  // return withErrorAugmented(context, functionExpression, () => {
  //   console.log("try call f")
  //   if (ie.thisValue !== undefined) {
  //     return f.call(ie.thisValue, ...callArgs)
  //   }
  //   return f(...callArgs)
  // })
  try {
    // console.log("try call f")
    if (ie.thisValue !== undefined) {
      return f.call(ie.thisValue, ...callArgs)
    }
    return f(...callArgs)
  } catch (e) {
    throw new InterpreterErrorWithContext(e, functionExpression)
    // console.log("catch to add location")
    // addErrorToContext(context, functionExpression)
    // // context.errorTraceInfo = {
    // //   errorCloseToCall: new Error("errorCloseToCall"),
    // //   failingLocation: {
    // //     lineIndex: functionExpression.lineIndex,
    // //     columnIndex: (functionExpression as AtomSingle).columnIndex ?? 0,
    // //   }
    // // }
    // throw e
  }
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

export function addErrorToContext(context: ThyBlockContext, atom: Atom) {
  context.errorTraceInfo = {
    errorCloseToCall: new Error("errorCloseToCall"),
    failingLocation: {
      lineIndex: atom.lineIndex,
      columnIndex: (atom as AtomSingle).columnIndex ?? 0,
    }
  }
}

// export function withErrorAugmented<T>(context: ThyBlockContext, atom: Atom, exercise: () => T): T {
//   try {
//     return exercise()
//   } catch (e) {
//     console.log("catch to add location")
//     context.errorTraceInfo = {
//       errorCloseToCall: new Error("errorCloseToCall"),
//       failingLocation: {
//         lineIndex: atom.lineIndex,
//         columnIndex: (atom as AtomSingle).columnIndex ?? 0,
//       }
//     }
//     throw e
//   }
// }

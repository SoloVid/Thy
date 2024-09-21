import { AwaitAtom, Expression } from "tree"
import { interpretThyExpression } from "./expression"
import {
  InterpreterErrorWithContext
} from "./interpreter-error"
import { ThyBlockContext } from "./types"

export function doAwaitStuff(context: ThyBlockContext, awaitAtom: AwaitAtom, expression: Expression) {
  return (async () => {
    // For async stack traces, the trace is a bit different before and after a true await.
    const errorHere = new Error("errorHere")
    try {
      return await interpretThyExpression(context, expression)
        .target
    } catch (e) {
      throw new InterpreterErrorWithContext(e, awaitAtom.token, 0, errorHere, 1)
    }
  })()
}

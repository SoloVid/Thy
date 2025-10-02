import type { Block, Idea } from "tree"
import { returnStyle } from "tree"
import { forwardWait, MayWait, notWait } from "./async-helper"
import type { BlockOptions } from "./block"
import { interpretThyCall } from "./call"
import {
  RuntimeObject,
  RuntimeValue,
  yesIThinkThisIsRuntimeObject,
  yesThisValueIsForRuntime,
} from "./dynamic-type"
import { interpretThyExpression } from "./expression"
import { interpretThyStatement } from "./statement"
import type { ThyBlockContext } from "./types"

export function makeHelper(
  block: Block,
  options: BlockOptions,
  args: readonly RuntimeValue[],
) {
  // I don't fully understand the -1 here, but somehow we want a different number of lines masked in the top-level case vs. thy-internal cases.
  const additionalTraceLinesToHide = options.additionalTraceLinesToHide ?? -1

  const context: ThyBlockContext = {
    argsToUse: [...args],
    givenUsed: false,
    implicitArguments:
      args.length > 0 && typeof args[0] === "object" && !!args[0]
        ? yesIThinkThisIsRuntimeObject(args[0])
        : {},
    implicitArgumentFirstUsed: null,
    isAsync: block.isAsync,
    symbolTable: block.symbolTable,
    closure: options.closure as Record<string, RuntimeValue>,
    variablesInBlock: {},
    stackTracePath: options.stackTracePath,
    thyResolutionRelativePath: options.thyResolutionRelativePath,
    resolveThy: options.resolveThy,
  }

  type IdeaResult = [shouldReturn: boolean, value: RuntimeValue | undefined]
  function evaluateStatement(idea: Idea): MayWait<IdeaResult> {
    if (
      idea.type === "blank-line" ||
      idea.type === "comment" ||
      idea.type === "type-assignment" ||
      idea.type === "type-return"
    ) {
      return notWait([false, undefined])
    }
    if (idea.type === "return") {
      return forwardWait(
        interpretThyExpression(context, idea.args[0]),
        (ie) => [true, ie.target],
      )
    }
    if (idea.type === "let-call") {
      if (idea.call === null) {
        return notWait([false, undefined])
      }
      return forwardWait(interpretThyCall(context, idea.call), (returnValue) =>
        returnValue === undefined ? [false, undefined] : [true, returnValue],
      )
    }
    return forwardWait(interpretThyStatement(context, idea), () => [
      false,
      undefined,
    ])
  }

  function formulateResult() {
    const exportSource = block.exportedSymbols
    if (
      block.exportedSymbols.length === 0 ||
      block.returnStyle === returnStyle.explicitReturn
    ) {
      return undefined
    }
    const implicitReturn: RuntimeObject = {}
    for (const variableName of exportSource) {
      Object.defineProperty(implicitReturn, variableName, {
        enumerable: true,
        get() {
          return context.variablesInBlock[variableName]
        },
        set(newValue) {
          if (block.symbolTable.getSymbolInfo(variableName)?.isConstant) {
            throw new Error(
              `${variableName} is immutable and cannot be overwritten`,
            )
          }
          context.variablesInBlock[variableName] = newValue
        },
      })
    }
    return yesThisValueIsForRuntime(implicitReturn)
  }

  return {
    additionalTraceLinesToHide,
    context,
    evaluateStatement,
    formulateResult,
  }
}

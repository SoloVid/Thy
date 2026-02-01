import { makeSymbolTable } from "tree/symbol-table.ts"
import { RuntimeValue } from "./dynamic-type.ts"
import type { ThyBlockContext } from "./types.ts"

type TestContextOptions = {
  readonly argsToUse: unknown[]
  readonly givenUsed: boolean
  readonly implicitArguments: Readonly<Record<string, unknown>>
  readonly implicitArgumentFirstUsed: null | string
  readonly isAsync: boolean
  readonly closure: Record<string, unknown>
  readonly variablesInBlock: Record<string, unknown>
}

export const makeSimpleContext = (
  o: Partial<TestContextOptions> = {},
): ThyBlockContext => {
  return {
    argsToUse: (o.argsToUse ?? []) as RuntimeValue[],
    givenUsed: o.givenUsed ?? false,
    implicitArguments: (o.implicitArguments ?? {}) as Record<
      string,
      RuntimeValue
    >,
    implicitArgumentFirstUsed: o.implicitArgumentFirstUsed ?? null,
    isAsync: o.isAsync ?? false,
    symbolTable: makeSymbolTable(),
    variablesInBlock: (o.variablesInBlock ?? {}) as Record<
      string,
      RuntimeValue
    >,
    closure: (o.closure ?? {}) as Record<string, RuntimeValue>,
    stackTracePath: "<test thy source>",
    thyResolutionRelativePath: "source.thy",
    resolveThy: () => {
      throw new Error(`resolveThy() not implemented`)
    },
  }
}

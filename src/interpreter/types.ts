import type { ReadSymbolTable } from "tree/symbol-table.ts"
import type { RuntimeReturn, RuntimeValue } from "./dynamic-type.ts"

export type ThyBlockContext = {
  readonly argsToUse: RuntimeValue[]
  givenUsed: boolean
  readonly implicitArguments: Readonly<Record<string, RuntimeValue>>
  implicitArgumentFirstUsed: null | string
  readonly isAsync: boolean
  readonly symbolTable: ReadSymbolTable
  readonly closure: Record<string, RuntimeValue>
  readonly variablesInBlock: Record<string, RuntimeValue>
  /** Source file path for stack traces. */
  stackTracePath: string
  /** Relative source file path for thy() call resolution. */
  readonly thyResolutionRelativePath: string
  readonly resolveThy: (
    thyResolutionRelativePath: string,
    pathSpec: string,
  ) => RuntimeReturn
}

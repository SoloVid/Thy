import type { ReadSymbolTable } from "tree/symbol-table"
import type { RuntimeValue } from "./dynamic-type"

export type ThyBlockContext = {
  readonly argsToUse: RuntimeValue[]
  givenUsed: boolean
  readonly implicitArguments: Readonly<Record<string, RuntimeValue>>
  implicitArgumentFirstUsed: null | string
  readonly isAsync: boolean
  readonly symbolTable: ReadSymbolTable
  readonly closure: Record<string, RuntimeValue>
  readonly variablesInBlock: Record<string, RuntimeValue>
  sourceFile: string
}

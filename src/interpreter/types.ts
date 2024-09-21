import { ReadSymbolTable } from "tree/symbol-table"

export type ThyBlockContext = {
  readonly argsToUse: unknown[]
  givenUsed: boolean
  readonly implicitArguments: Readonly<Record<string, unknown>>
  implicitArgumentFirstUsed: null | string
  // readonly isAsync: boolean
  readonly symbolTable: ReadSymbolTable
  readonly closure: Record<string, unknown>
  readonly variablesInBlock: Record<string, unknown>
  sourceFile: string
}

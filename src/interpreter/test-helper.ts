import { makeSymbolTable } from "tree/symbol-table"
import type { ThyBlockContext } from "./types"
import { tTypeIdentifier, tValueIdentifier } from "tokenizer/token-type"
import { Token } from "tokenizer/token"

type TestContextOptions = Partial<ThyBlockContext> & {
  closureVariableIsImmutable?: Record<string, boolean>
}

export const makeSimpleContext = (
  o: TestContextOptions = {},
): ThyBlockContext => {
  const parentSymbolTable = makeSymbolTable()
  if (o.closure) {
    for (const key of Object.keys(o.closure)) {
      parentSymbolTable.addSymbol({
        type: tValueIdentifier,
        text: key
      } as Token<typeof tValueIdentifier | typeof tTypeIdentifier>, o.closureVariableIsImmutable?.[key] ?? false,
    "bare")
      // console.log(`added symbol ${key}`)
      // console.log(parentSymbolTable.getSymbolInfo(key))
    }
  }
  const symbolTable = parentSymbolTable.makeChild()
  // console.log(symbolTable)
  // console.log(symbolTable.getSymbolInfo("x"))
  return {
  argsToUse: [],
  givenUsed: false,
  implicitArguments: {},
  implicitArgumentFirstUsed: null,
  symbolTable,
  variablesInBlock: {},
  closure: {},
  sourceFile: "<test thy source>",
  ...o,
}
}

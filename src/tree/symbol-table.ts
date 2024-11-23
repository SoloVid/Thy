import type { Token } from "tokenizer"
import type { tTypeIdentifier, tValueIdentifier } from "tokenizer/token-type"

export interface ReadSymbolTable {
  readonly localSymbols: Readonly<Map<string, SymbolInfo>>
  readonly getSymbolInfo: (name: string) => SymbolInfo | null
}

export interface SymbolTable extends ReadSymbolTable {
  readonly localSymbols: Readonly<Map<string, SymbolInfo>>
  /** Scan local table and child tables to see if symbol already used. */
  readonly isSymbolNameTakenHereOrInChild: (name: string) => boolean

  readonly addSymbol: (
    token: Token<typeof tValueIdentifier | typeof tTypeIdentifier>,
    isConstant: boolean,
    visibility: SymbolVisibility,
  ) => void
  readonly makeChild: () => SymbolTable
}

export type SymbolVisibility = "bare" | "export" | "private"
export interface SymbolInfo {
  readonly token: Token<typeof tValueIdentifier | typeof tTypeIdentifier>
  readonly isConstant: boolean
  readonly visibility: SymbolVisibility
}

export function makeSymbolTable(parent?: SymbolTable): SymbolTable {
  const localSymbols = new Map<string, SymbolInfo>()

  const childTables: SymbolTable[] = []

  const me: SymbolTable = {
    localSymbols,
    getSymbolInfo(name) {
      if (localSymbols.has(name)) {
        return localSymbols.get(name)!
      }
      if (parent !== undefined) {
        return parent.getSymbolInfo(name)
      }
      return null
    },
    isSymbolNameTakenHereOrInChild(name) {
      if (name in localSymbols) {
        return true
      }
      for (const child of childTables) {
        if (child.isSymbolNameTakenHereOrInChild(name)) {
          return true
        }
      }
      return false
    },
    addSymbol(token, isConstant, visibility) {
      localSymbols.set(token.text, { token, isConstant, visibility })
    },
    makeChild() {
      const child = makeSymbolTable(me)
      childTables.push(child)
      return child
    },
  }
  return me
}

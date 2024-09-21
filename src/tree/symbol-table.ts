import type { Token } from "../tokenizer/token"
import type { tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type"

export interface ReadSymbolTable {
  readonly localSymbols: Readonly<Map<string, SymbolInfo>>
  getSymbolInfo(name: string): SymbolInfo | null
}

export interface SymbolTable extends ReadSymbolTable {
  readonly localSymbols: Readonly<Map<string, ExtendedSymbolInfo>>
  /** Scan local table and child tables to see if symbol already used. */
  isSymbolNameTakenHereOrInChild(name: string): boolean

  addSymbol(
    token: Token<typeof tValueIdentifier | typeof tTypeIdentifier>,
    isConstant: boolean,
    visibility: SymbolVisibility,
  ): void
  makeChild(): SymbolTable
}

export interface SymbolInfo {
  readonly token: Token<typeof tValueIdentifier | typeof tTypeIdentifier>
  readonly isConstant: boolean
}

type SymbolVisibility = "bare" | "export" | "private"
export interface ExtendedSymbolInfo extends SymbolInfo {
  readonly visibility: SymbolVisibility
}

export function makeSymbolTable(parent?: SymbolTable): SymbolTable {
  const localSymbols = new Map<string, ExtendedSymbolInfo>()

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

import type { Token } from "../tokenizer/token";

export interface ReadSymbolTable {
    readonly localSymbols: Readonly<Map<string, SymbolInfo>>
    getSymbolInfo(name: string): SymbolInfo | null
}

export interface SymbolTable extends ReadSymbolTable {
    /** Scan local table and child tables to see if symbol already used. */
    isSymbolNameTakenHereOrInChild(name: string): boolean

    addSymbol(token: Token<string>, isConstant: boolean): void
    makeChild(): SymbolTable
}

export interface SymbolInfo {
    readonly token: Token<string>
    readonly isConstant: boolean
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
        addSymbol(token, isConstant) {
            localSymbols.set(token.text, { token, isConstant })
        },
        makeChild() {
            const child = makeSymbolTable(me)
            childTables.push(child)
            return child
        }
    }
    return me
}

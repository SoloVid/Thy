import type { ReadSymbolTable } from "./symbol-table"

export type BaseTreeNode = {
    type: string
    symbolTable: ReadSymbolTable
}
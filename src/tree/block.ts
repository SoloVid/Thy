import type { Idea } from "./idea"
import type { SymbolTable } from "./symbol-table"
import type { TokenRange } from "./token-range"

export const returnStyle = {
  implicitExport: "implicitExport",
  explicitExport: "explicitExport",
  explicitReturn: "explicitReturn",
} as const
export type ReturnStyle = (typeof returnStyle)[keyof typeof returnStyle]
export const returnStylePrecedence = [
  returnStyle.explicitReturn,
  returnStyle.explicitExport,
  returnStyle.implicitExport,
]

export interface Block extends TokenRange {
  type: "block"
  symbolTable: SymbolTable
  ideas: readonly Idea[]
  returnStyle: ReturnStyle
  isAsync: boolean
}

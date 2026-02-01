import type { Idea } from "./idea.ts"
import type { ReadSymbolTable } from "./symbol-table.ts"
import type { TokenRange } from "common/token-range.ts"

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
  readonly type: "block"
  readonly symbolTable: ReadSymbolTable
  readonly explicitParameterCount: number
  readonly isAsync: boolean
  readonly ideas: readonly Idea[]
  readonly returnStyle: ReturnStyle
  readonly exportedSymbols: readonly string[]
}

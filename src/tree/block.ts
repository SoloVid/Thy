import type { Assignment } from "./assignment";
import type { Call } from "./call";
import type { NonCode } from "./non-code";
import { SymbolTable } from "./symbol-table";
import type { TokenRange } from "./token-range";
import { TypeAssignment } from "./type-assignment";
import { TypeCall } from "./type-call";
import { LetCall } from "./let-call";

export const returnStyle = {
    implicitExport: "implicitExport",
    explicitExport: "explicitExport",
    explicitReturn: "explicitReturn",
    asyncReturn: "asyncReturn",
} as const
export type ReturnStyle = typeof returnStyle[keyof typeof returnStyle]
export const returnStylePrecedence = [
    returnStyle.asyncReturn,
    returnStyle.explicitReturn,
    returnStyle.explicitExport,
    returnStyle.implicitExport,
]

export interface Block extends TokenRange {
    type: "block"
    symbolTable: SymbolTable
    ideas: (Assignment | BlankLine | Call | NonCode | TypeAssignment | TypeCall | LetCall)[]
    returnStyle: ReturnStyle
}

export interface BlankLine {
    type: "blank-line"
}

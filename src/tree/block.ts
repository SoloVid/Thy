import type { Assignment } from "./assignment";
import type { Call } from "./call";
import type { NonCode } from "./non-code";
import type { SymbolTable } from "./symbol-table";
import type { TokenRange } from "./token-range";
import type { TypeAssignment } from "./type-assignment";
import type { TypeCall } from "./type-call";
import type { LetCall } from "./let-call";
import type { BaseTreeNode } from "./base-tree-node";

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

export interface Block extends BaseTreeNode, TokenRange {
    type: "block"
    symbolTable: SymbolTable
    ideas: (Assignment | BlankLine | Call | NonCode | TypeAssignment | TypeCall | LetCall)[]
    returnStyle: ReturnStyle
}

export interface BlankLine extends BaseTreeNode {
    type: "blank-line"
}

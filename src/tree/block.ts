import type { Assignment } from "./assignment";
import type { Call } from "./call";
import type { NonCode } from "./non-code";
import { SymbolTable } from "./symbol-table";
import type { TokenRange } from "./token-range";
import { TypeAssignment } from "./type-assignment";
import { TypeCall } from "./type-call";
import { YieldCall } from "./yield-call";

export interface Block extends TokenRange {
    type: "block"
    symbolTable: SymbolTable
    ideas: (Assignment | BlankLine | Call | NonCode | TypeAssignment | TypeCall | YieldCall)[]
}

export interface BlankLine {
    type: "blank-line"
}

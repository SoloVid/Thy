import type { SaferToken } from "../tokenizer/token"
import {
  tConstDeclAssign,
  tExport,
  tNoDeclAssign,
  tPrivate,
  tVarDeclAssign,
} from "../tokenizer/token-type"
import type { ValueIdentifier } from "./atom"
import type { AwaitCall, GivenCall, ValueCall } from "./call"
import type { ErrorValue } from "./error"
import type { ValuePropertyAccess } from "./property-access"
import type { TokenRange } from "./token-range"

export type Assignment =
  | ConstantDeclaration
  | VariableDeclaration
  | VariableReassignment
  | PropertyAssignment
export type Declaration = ConstantDeclaration | VariableDeclaration

const assignmentTypes: readonly Assignment["type"][] = [
  "constant-declaration",
  "variable-declaration",
  "variable-reassignment",
  "property-assignment",
]
export function isAssignment(node: unknown): node is Assignment {
  const a = node as Assignment
  return !!a && assignmentTypes.includes(a.type)
}

const declarationTypes: readonly Declaration["type"][] = [
  "constant-declaration",
  "variable-declaration",
]
export function isDeclaration(node: unknown): node is Declaration {
  const d = node as Declaration
  return !!d && declarationTypes.includes(d.type)
}

export interface ConstantDeclaration extends TokenRange {
  type: "constant-declaration"
  modifier: SaferToken<typeof tExport | typeof tPrivate> | null
  variable: ErrorValue | ValueIdentifier
  operator: SaferToken<typeof tConstDeclAssign>
  call: ValueCall | AwaitCall | GivenCall
}

export interface VariableDeclaration extends TokenRange {
  type: "variable-declaration"
  modifier: SaferToken<typeof tExport | typeof tPrivate> | null
  variable: ErrorValue | ValueIdentifier
  operator: SaferToken<typeof tVarDeclAssign>
  call: ValueCall | AwaitCall | GivenCall
}

export interface PropertyAssignment extends TokenRange {
  type: "property-assignment"
  modifier: null
  variable: ErrorValue | ValuePropertyAccess
  operator: SaferToken<typeof tNoDeclAssign>
  call: ValueCall | AwaitCall | GivenCall
}

export interface VariableReassignment extends TokenRange {
  type: "variable-reassignment"
  modifier: null
  variable: ErrorValue | ValueIdentifier
  operator: SaferToken<typeof tNoDeclAssign>
  call: ValueCall | AwaitCall | GivenCall
}

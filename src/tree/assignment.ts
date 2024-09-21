import type { TokenRange } from "common/token-range"
import type { Token } from "tokenizer"
import {
  tConstDeclAssign,
  tExport,
  tNoDeclAssign,
  tPrivate,
  tVarDeclAssign,
} from "tokenizer/token-type"
import type { ValueIdentifier } from "./atom"
import type { AwaitCall, GivenCall, ValueCall } from "./call"
import type { ValuePropertyAccess } from "./property-access"
import { TreeNode } from "./tree-node"

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
export function isAssignment(node: TreeNode): node is Assignment {
  const a = node as Assignment
  return assignmentTypes.includes(a.type)
}

const declarationTypes: readonly Declaration["type"][] = [
  "constant-declaration",
  "variable-declaration",
]
export function isDeclaration(node: TreeNode): node is Declaration {
  const d = node as Declaration
  return declarationTypes.includes(d.type)
}

export interface ConstantDeclaration extends TokenRange {
  readonly type: "constant-declaration"
  readonly modifier: Token<typeof tExport | typeof tPrivate> | null
  readonly variable: ValueIdentifier
  readonly operator: Token<typeof tConstDeclAssign>
  readonly call: ValueCall | AwaitCall | GivenCall
}

export interface VariableDeclaration extends TokenRange {
  readonly type: "variable-declaration"
  readonly modifier: Token<typeof tExport | typeof tPrivate> | null
  readonly variable: ValueIdentifier
  readonly operator: Token<typeof tVarDeclAssign>
  readonly call: ValueCall | AwaitCall | GivenCall
}

export interface PropertyAssignment extends TokenRange {
  readonly type: "property-assignment"
  readonly modifier: null
  readonly variable: ValuePropertyAccess
  readonly operator: Token<typeof tNoDeclAssign>
  readonly call: ValueCall | AwaitCall | GivenCall
}

export interface VariableReassignment extends TokenRange {
  readonly type: "variable-reassignment"
  readonly modifier: null
  readonly variable: ValueIdentifier
  readonly operator: Token<typeof tNoDeclAssign>
  readonly call: ValueCall | AwaitCall | GivenCall
}

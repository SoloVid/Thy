import type { TokenRange } from "common/token-range"
import type { Token } from "tokenizer"
import type { tThat, tValueIdentifier } from "tokenizer/token-type"
import type {
  CallableExpression,
  Expression,
  TypeExpression,
} from "./expression"
import type { PrimitiveStringLiteral } from "./string"
import type { AwaitTerm, GivenTerm, ReturnTerm, ThyTerm } from "./term"
import type { TreeNode } from "./tree-node"

export type Call = AwaitCall | GivenCall | ThyCall | ValueCall

const callTypes: readonly Call["type"][] = [
  "await-call",
  "given-call",
  "thy-call",
  "value-call",
]
export function isCall(node: TreeNode): node is Call {
  const c = node as Call
  return callTypes.includes(c.type)
}

export interface ValueCall extends TokenRange {
  readonly type: "value-call"
  readonly func: CallableExpression
  readonly funcToken: Token<typeof tValueIdentifier | typeof tThat> | null
  readonly typeArgs: readonly TypeExpression[]
  readonly args: readonly Expression[]
}

export interface AwaitCall extends TokenRange {
  readonly type: "await-call"
  readonly func: AwaitTerm
  readonly typeArgs: readonly []
  readonly args: readonly [Expression]
}

export interface GivenCall extends TokenRange {
  readonly type: "given-call"
  readonly func: GivenTerm
  readonly typeArgs: readonly [] | readonly [TypeExpression]
  readonly args: readonly [] | readonly [Expression]
}

export interface Return extends TokenRange {
  readonly type: "return"
  readonly func: ReturnTerm
  readonly typeArgs: readonly [] | readonly [TypeExpression]
  readonly args: readonly [Expression]
}

export interface ThyCall extends TokenRange {
  readonly type: "thy-call"
  readonly func: ThyTerm
  readonly typeArgs: readonly []
  readonly args: readonly [PrimitiveStringLiteral]
}

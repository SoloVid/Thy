import { Token } from "tokenizer/token"
import { AwaitAtom, GivenAtom, ReturnAtom } from "./atom"
import type {
  CallableExpression,
  Expression,
  TypeExpression,
} from "./expression"
import type { TokenRange } from "./token-range"
import { TreeNode } from "./tree-node"
import { tThat, tValueIdentifier } from "tokenizer/token-type"

export type Call = AwaitCall | GivenCall | ValueCall

const callTypes: readonly Call["type"][] = [
  "await-call",
  "given-call",
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
  readonly func: AwaitAtom
  readonly typeArgs: readonly []
  readonly args: readonly [Expression]
}

export interface GivenCall extends TokenRange {
  readonly type: "given-call"
  readonly func: GivenAtom
  readonly typeArgs: readonly [] | readonly [TypeExpression]
  readonly args: readonly [] | readonly [Expression]
}

export interface Return extends TokenRange {
  readonly type: "return"
  readonly func: ReturnAtom
  readonly typeArgs: readonly [] | readonly [TypeExpression]
  readonly args: readonly [Expression]
}

import { AwaitAtom, GivenAtom, ReturnAtom } from "./atom"
import type {
  CallableExpression,
  Expression,
  TypeExpression,
} from "./expression"
import type { TokenRange } from "./token-range"

export type Call = AwaitCall | GivenCall | ValueCall

export interface ValueCall extends TokenRange {
  readonly type: "value-call"
  readonly func: CallableExpression
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

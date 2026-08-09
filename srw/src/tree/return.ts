import type {
  Expression
} from "./expression.ts"

export interface ReturnTerm {
  readonly type: "return-term"
}

export interface Return {
  readonly type: "return"
  readonly func: ReturnTerm
  readonly args: readonly [Expression]
}

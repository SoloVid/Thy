import type {
  Expression,
  TypeIdentifier,
  TypePropertyAccess,
  ValueIdentifier,
  ValuePropertyAccess,
} from "tree"
import type { TypeExpression } from "tree/expression"
import type { SaferToken } from "../tokenizer/token"
import type { tThat } from "../tokenizer/token-type"
import type {
  IndeterminateExpression,
  IndeterminateTypeExpression,
} from "./parse-expression"
import type { ParserState } from "./parser-state"

export type TempThatNode = {
  type: "that"
  token: SaferToken<typeof tThat>
}

export type IndeterminateTypePropertyAccess = Omit<
  TypePropertyAccess,
  "type" | "base"
> & {
  type: "indeterminate-type-property-access"
  base: TypeIdentifier | ValueIdentifier | TempThatNode
}

export type IndeterminateValuePropertyAccess = Omit<
  ValuePropertyAccess,
  "type" | "base"
> & {
  type: "indeterminate-value-property-access"
  base: ValueIdentifier | TempThatNode
}
export type UnsafeIndeterminateValuePropertyAccess = Omit<
  IndeterminateTypePropertyAccess,
  "type"
>

type Indeterminate =
  | IndeterminateExpression
  | IndeterminateTypeExpression
  | TempThatNode
type Determined<T extends Indeterminate> = T extends
  | IndeterminateTypePropertyAccess
  | IndeterminateValuePropertyAccess
  | TempThatNode
  ? T extends TempThatNode
    ? Expression
    : T extends IndeterminateTypePropertyAccess
      ? TypePropertyAccess
      : T extends IndeterminateValuePropertyAccess
        ? ValuePropertyAccess
        : never
  : T

export function collapseThats<T extends Indeterminate>(
  state: ParserState,
  inputs: readonly T[],
): Determined<T>[] {
  return inputs.reduceRight((soFar, input) => {
    return [collapseThat(state, input), ...soFar]
  }, [] as Determined<T>[])
}

export function collapseThat<T extends Indeterminate>(
  state: ParserState,
  input: T,
): Determined<T> {
  if (input.type === "that") {
    return state.context.takeThat(input) as Determined<T>
  }
  if (input.type === "indeterminate-type-property-access") {
    const mapped: TypePropertyAccess = {
      type: "type-property-access",
      base:
        input.base.type === "that"
          ? state.context.takeThat(input.base)
          : input.base,
      propertyAccesses: input.propertyAccesses,
      firstToken: input.firstToken,
      lastToken: input.lastToken,
    }
    return mapped as Determined<T>
  }
  if (input.type === "indeterminate-value-property-access") {
    const mapped: ValuePropertyAccess = {
      type: "value-property-access",
      base:
        input.base.type === "that"
          ? state.context.takeThat(input.base)
          : input.base,
      propertyAccesses: input.propertyAccesses,
      firstToken: input.firstToken,
      lastToken: input.lastToken,
    }
    return mapped as Determined<T>
  }
  const alreadyFine: Expression | TypeExpression = input
  return alreadyFine as Determined<T>
}

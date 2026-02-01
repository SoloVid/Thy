import type { Token } from "tokenizer"
import type { tThat } from "tokenizer/token-type.ts"
import type {
  Expression,
  TypeExpression,
  TypeIdentifier,
  TypePropertyAccess,
  ValueIdentifier,
  ValuePropertyAccess,
} from "tree"
import { type BadParse, badParse } from "./error.ts"
import type {
  IndeterminateExpression,
  IndeterminateTypeExpression,
} from "./parse-expression.ts"
import type { ParserState } from "./parser-state.ts"

export type TempThatNode = {
  readonly type: "that"
  readonly token: Token<typeof tThat>
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
): Determined<T>[] | BadParse {
  const result = inputs.reduceRight(
    (soFar: (Determined<T> | BadParse)[], input: T) => {
      const next: (Determined<T> | BadParse)[] = [
        collapseThat(state, input),
        ...soFar,
      ]
      return next
    },
    [] as (Determined<T> | BadParse)[],
  )
  if (result.some((output) => output === badParse)) {
    return badParse
  }
  return result as Determined<T>[]
}

export function collapseThat<T extends Indeterminate>(
  state: ParserState,
  input: T,
): Determined<T> | BadParse {
  if (input.type === "that") {
    return state.context.takeThat(input) as Determined<T>
  }
  if (input.type === "indeterminate-type-property-access") {
    const base =
      input.base.type === "that"
        ? state.context.takeThat(input.base)
        : input.base
    if (base === badParse) return badParse
    const mapped: TypePropertyAccess = {
      type: "type-property-access",
      base,
      baseToken: input.baseToken,
      propertyAccesses: input.propertyAccesses,
      firstToken: input.firstToken,
      lastToken: input.lastToken,
    }
    return mapped as Determined<T>
  }
  if (input.type === "indeterminate-value-property-access") {
    const base =
      input.base.type === "that"
        ? state.context.takeThat(input.base)
        : input.base
    if (base === badParse) return badParse
    const mapped: ValuePropertyAccess = {
      type: "value-property-access",
      base,
      baseToken: input.baseToken,
      propertyAccesses: input.propertyAccesses,
      firstToken: input.firstToken,
      lastToken: input.lastToken,
    }
    return mapped as Determined<T>
  }
  const alreadyFine: Expression | TypeExpression = input
  return alreadyFine as Determined<T>
}

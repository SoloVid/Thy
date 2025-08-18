import type { TokenRange } from "common/token-range"
import type { Token } from "tokenizer"
import type { tStringText } from "tokenizer/token-type"
import type { ValueIdentifier } from "./term"

export interface PrimitiveStringLiteral extends StringLiteral {
  readonly parts: readonly StringContent[]
}

export interface StringLiteral extends TokenRange {
  readonly type: "string-literal"
  readonly parts: readonly StringPart[]
}

export type StringPart = StringContent | StringInterpolation

export interface StringContent {
  readonly type: "string-content"
  readonly token: Token<typeof tStringText>
}

export interface StringInterpolation extends TokenRange {
  readonly type: "string-interpolation"
  readonly value: ValueIdentifier
}

import { Token } from "tokenizer/token"
import { tStringText } from "tokenizer/token-type"
import { ValueIdentifier } from "./atom"
import { TokenRange } from "./token-range"

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

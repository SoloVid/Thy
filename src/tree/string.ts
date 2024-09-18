import { SaferToken, Token } from "tokenizer/token"
import { TokenRange } from "./token-range"
import { tStringText, tValueIdentifier } from "tokenizer/token-type"
import { ValueIdentifier } from "./atom"
import { ErrorValue } from "./error"

export interface StringLiteral extends TokenRange {
  readonly type: "string-literal"
  readonly parts: readonly StringPart[]
}

export type StringPart = StringContent | StringInterpolation

export interface StringContent {
  readonly type: "string-content"
  readonly token: SaferToken<typeof tStringText>
}

export interface StringInterpolation extends TokenRange {
  readonly type: "string-interpolation"
  readonly value: ValueIdentifier | ErrorValue
}

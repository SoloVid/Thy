import type { TokenRange } from "common/token-range"
import type { Token } from "tokenizer"
import type { tLet } from "tokenizer/token-type"
import type { Call } from "./call"

export interface LetCall extends TokenRange {
  readonly type: "let-call"
  readonly letToken: Token<typeof tLet>
  readonly call: Call | null
}

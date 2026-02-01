import type { TokenRange } from "common/token-range.ts"
import type { Token } from "tokenizer"
import type { tLet } from "tokenizer/token-type.ts"
import type { Call } from "./call.ts"

export interface LetCall extends TokenRange {
  readonly type: "let-call"
  readonly letToken: Token<typeof tLet>
  readonly call: Call | null
}

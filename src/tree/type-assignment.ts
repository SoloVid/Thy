import type { TokenRange } from "common/token-range.ts"
import type { Token } from "tokenizer"
import type {
  tConstDeclAssign,
  tExport,
  tPrivate,
  tType,
} from "tokenizer/token-type.ts"
import type { TypeIdentifier } from "./term.ts"
import type { Call } from "./call.ts"
import type { TypeCall, TypeGivenCall } from "./type-call.ts"

export interface TypeAssignment extends TokenRange {
  readonly type: "type-assignment"
  readonly modifier: Token<typeof tExport | typeof tPrivate> | null
  readonly typeToken: Token<typeof tType>
  readonly variable: TypeIdentifier
  readonly operator: Token<typeof tConstDeclAssign>
  readonly call: TypeCall | TypeGivenCall | Call
}

import type { Token } from "../tokenizer/token"
import type {
  tConstDeclAssign,
  tExport,
  tPrivate,
  tType,
} from "../tokenizer/token-type"
import type { TypeIdentifier } from "./atom"
import type { Call } from "./call"
import type { TokenRange } from "./token-range"
import type { TypeCall, TypeGivenCall } from "./type-call"

export interface TypeAssignment extends TokenRange {
  readonly type: "type-assignment"
  readonly modifier: Token<typeof tExport | typeof tPrivate> | null
  readonly typeToken: Token<typeof tType>
  readonly variable: TypeIdentifier
  readonly operator: Token<typeof tConstDeclAssign>
  readonly call: TypeCall | TypeGivenCall | Call
}

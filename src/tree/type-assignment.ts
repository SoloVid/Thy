import type { SaferToken } from "../tokenizer/token"
import type {
  tConstDeclAssign,
  tExport,
  tPrivate,
  tType,
} from "../tokenizer/token-type"
import type { TypeIdentifier } from "./atom"
import type { Call } from "./call"
import type { ErrorValue } from "./error"
import type { TokenRange } from "./token-range"
import type { TypeCall } from "./type-call"

export interface TypeAssignment extends TokenRange {
  type: "type-assignment"
  modifier: SaferToken<typeof tExport | typeof tPrivate> | null
  typeToken: SaferToken<typeof tType>
  variable: TypeIdentifier | ErrorValue
  operator: SaferToken<typeof tConstDeclAssign> | ErrorValue
  call: TypeCall | Call
}

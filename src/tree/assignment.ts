import type { SaferToken } from "../tokenizer/token"
import type {
  tConstDeclAssign,
  tExport,
  tNoDeclAssign,
  tPrivate,
  tVarDeclAssign,
} from "../tokenizer/token-type"
import type { ValueIdentifier } from "./atom"
import type { AwaitCall, GivenCall, ValueCall } from "./call"
import type { ErrorValue } from "./error"
import type { ValuePropertyAccess } from "./property-access"
import type { TokenRange } from "./token-range"

export interface Assignment extends TokenRange {
  type: "assignment"
  modifier: SaferToken<typeof tExport | typeof tPrivate> | null
  variable: ErrorValue | ValueIdentifier | ValuePropertyAccess
  operator: SaferToken<
    typeof tConstDeclAssign | typeof tVarDeclAssign | typeof tNoDeclAssign
  >
  call: ValueCall | AwaitCall | GivenCall
}

// export interface ScopedAssignment extends BaseAssignment {
//   modifier: null
//   variable:
//     | ErrorValue
//     | ValuePropertyAccess
//   operator: SaferToken<
//     typeof tNoDeclAssign
//   >
// }

// export interface UnscopedAssignment extends BaseAssignment {
//   modifier: SaferToken<typeof tExport | typeof tPrivate> | null
//   variable:
//   |ErrorValue
//     | ValueIdentifier
//   operator: SaferToken<
//     typeof tConstDeclAssign | typeof tVarDeclAssign | typeof tNoDeclAssign
//   >
// }

// export type Assignment = UnscopedAssignment | ScopedAssignment

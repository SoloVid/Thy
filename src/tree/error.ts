import { Token } from "tokenizer/token"
import { TokenRange } from "./token-range"

/**
 * A placeholder for some unexpected token that can be treated downstream as an arbitrary value.
 */
export type ErrorValue = ErrorValueSingleToken | ErrorValueTokenRange
interface ErrorValueSingleToken {
  type: "error-value"
  token: Token
}
interface ErrorValueTokenRange extends TokenRange {
  type: "error-value"
}

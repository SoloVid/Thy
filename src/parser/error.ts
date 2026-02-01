import { tokenError, tokenRangeError } from "common/compile-error.ts"
import type { TokenRange } from "common/token-range.ts"
import type { Token } from "tokenizer"
import type { BlankLine, TreeNode } from "tree"
import type { IndeterminateExpression } from "./parse-expression.ts"
import type { ParserState } from "./parser-state.ts"
import type { IndeterminateTypePropertyAccess } from "./that.ts"

export const badParse = Symbol("badParse")
export type BadParse = typeof badParse

export type ErrorableTreeNode =
  | Exclude<TreeNode, BlankLine | Comment>
  | IndeterminateExpression
  | IndeterminateTypePropertyAccess

export function addTokenError(
  state: ParserState,
  token: Token,
  message: string,
) {
  state.addError(tokenError(token, message))
}

export function addTokenRangeError(
  state: ParserState,
  tokenRange: TokenRange,
  message: string,
) {
  state.addError(tokenRangeError(tokenRange, message))
}

export function addNodeError(
  state: ParserState,
  node: ErrorableTreeNode,
  message: string,
) {
  if ("token" in node) {
    addTokenError(state, node.token, message)
    return
  }
  addTokenRangeError(state, node, message)
}

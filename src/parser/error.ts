import { CompileError, tokenError, tokenRangeError } from "compile-error"
import { Token } from "tokenizer/token"
import { BlankLine, TokenRange, TreeNode } from "tree"
import { IndeterminateExpression } from "./parse-expression"
import { ParserState } from "./parser-state"
import { IndeterminateTypePropertyAccess } from "./that"

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

export function nodeError(
  node: ErrorableTreeNode,
  message: string,
): CompileError {
  if ("token" in node) {
    return tokenError(node.token, message)
  }
  return tokenRangeError(node, message)
}

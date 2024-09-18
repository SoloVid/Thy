import { Token } from "tokenizer/token"
import { ParserState } from "./parser-state"
import { CompileError, tokenError, tokenRangeError } from "compile-error"
import { NumberLiteral } from "tree/atom"
import { ErrorValue } from "tree/error"
import { BlankLine, TokenRange, TreeNode } from "tree"
import { IndeterminateExpression } from "./parse-expression"
import { IndeterminateTypePropertyAccess } from "./that"

export type ErrorableTreeNode =
  | Exclude<TreeNode, BlankLine | Comment>
  | IndeterminateExpression
  | IndeterminateTypePropertyAccess

export function addTokenError(
  state: ParserState,
  token: Token,
  message: string,
): ErrorValue {
  state.addError(tokenError(token, message))
  return {
    type: "error-value",
    token: token,
  }
}

export function addTokenRangeError(
  state: ParserState,
  tokenRange: TokenRange,
  message: string,
): ErrorValue {
  state.addError(tokenRangeError(tokenRange, message))
  return {
    type: "error-value",
    firstToken: tokenRange.firstToken,
    lastToken: tokenRange.lastToken,
  }
}

export function addNodeError(
  state: ParserState,
  node: ErrorableTreeNode,
  message: string,
): ErrorValue {
  if ("token" in node) {
    return addTokenError(state, node.token, message)
  }
  return addTokenRangeError(state, node, message)
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

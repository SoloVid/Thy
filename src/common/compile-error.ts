import type { Token } from "tokenizer"
import type { TokenRange } from "./token-range"
import type { TreeNode } from "tree"

export interface CompileError {
  readonly message: string
  readonly start: Token
  readonly end: Token
}

export function tokenError(token: Token, message: string): CompileError {
  return {
    message,
    start: token,
    end: token,
  }
}

export function tokenRangeError(
  tokenRange: TokenRange,
  message: string,
): CompileError {
  return {
    message,
    start: tokenRange.firstToken,
    end: tokenRange.lastToken,
  }
}

export function nodeError(node: TreeNode, message: string) {
  if ("token" in node) {
    return tokenError(node.token, message)
  }
  return tokenRangeError(node, message)
}

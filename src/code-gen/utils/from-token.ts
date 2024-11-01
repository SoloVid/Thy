import type { Token } from "tokenizer"
import type { MappedGeneratedSnippet } from "../generator"

export function fromToken(token: Token, text?: string): MappedGeneratedSnippet {
  return {
    text: text ?? token.text,
    sourceFirstToken: token,
  }
}

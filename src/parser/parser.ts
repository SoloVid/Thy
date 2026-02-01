import type { CompileError } from "common/compile-error.ts"
import type { Tokenizer } from "tokenizer"
import type { Block } from "tree"
import { parseBlockInner } from "./parse-block.ts"
import { makeParserState } from "./parser-state.ts"

export interface ParserOutput {
  top: Block
  errors: CompileError[]
  references: readonly string[]
}

export function parse(
  tokenizer: Tokenizer,
  errors: CompileError[] = [],
): ParserOutput {
  const state = makeParserState(tokenizer, errors)
  return {
    top: parseBlockInner(state),
    errors: errors,
    references: state.references,
  }
}

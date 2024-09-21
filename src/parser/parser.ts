import type { CompileError } from "common/compile-error"
import type { Tokenizer } from "tokenizer"
import type { Block } from "tree"
import { parseBlockInner } from "./parse-block"
import { makeParserState } from "./parser-state"

export interface ParserOutput {
  top: Block
  errors: CompileError[]
}

export function parse(
  tokenizer: Tokenizer,
  errors: CompileError[] = [],
): ParserOutput {
  return {
    top: parseBlockInner(makeParserState(tokenizer, errors)),
    errors: errors,
  }
}

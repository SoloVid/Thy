import type { CompileError } from "../compile-error"
import type { Tokenizer } from "../tokenizer/tokenizer"
import type { Block } from "../tree/block"
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

import type { Tokenizer } from "../tokenizer/tokenizer";
import type { Block } from "../tree/block";
import { parseBlock } from "./parse-block";
import type { ParserState } from "./parser-state";
import { makeTokenBuffer } from "./token-buffer";

export function parse(tokenizer: Tokenizer): Block {
    const state: ParserState = {
        buffer: makeTokenBuffer(tokenizer)
    }
    return parseBlock(state)
}
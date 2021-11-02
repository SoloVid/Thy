import assert from "assert";
import { tStartBlock, tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "../tree/atom";
import type { Block } from "../tree/block";
import type { Identifier } from "../tree/identifier";
import { parseBlock } from "./parse-block";
import { parseIdentifier } from "./parse-identifier";
import type { ParserState } from "./parser-state";

export function parseArguable(state: ParserState): Atom | Block | Identifier {
    const nextToken = state.buffer.peekToken()
    assert(nextToken !== null)
    if (nextToken.type === tStartBlock) {
        return parseBlock(state)
    }

    if (nextToken.type === tTypeIdentifier || nextToken.type === tValueIdentifier) {
        return parseIdentifier(state)
    }

    return {
        type: "atom",
        token: state.buffer.consumeToken()
    }
}

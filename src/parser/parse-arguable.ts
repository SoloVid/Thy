import assert from "assert";
import { tStartBlock, tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Expression } from "../tree/expression";
import { parseBlock } from "./parse-block";
import { parseNamedExpression } from "./parse-named-expression";
import type { ParserState } from "./parser-state";

export function parseArguable(state: ParserState): Expression {
    const nextToken = state.buffer.peekToken()
    assert(nextToken !== null)
    if (nextToken.type === tStartBlock) {
        return parseBlock(state)
    }

    if (nextToken.type === tTypeIdentifier || nextToken.type === tValueIdentifier) {
        return parseNamedExpression(state)
    }

    return {
        type: "atom",
        token: state.buffer.consumeToken()
    }
}

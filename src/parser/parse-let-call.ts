import assert from "assert";
import { tLet } from "../tokenizer/token-type";
import type { LetCall } from "../tree/let-call";
import { parseCall } from "./parse-call";
import type { ParserState } from "./parser-state";

export function parseLetCall(state: ParserState): LetCall {
    const letToken = state.buffer.consumeToken()
    assert(letToken.type === tLet)
    const call = parseCall(state)
    return {
        type: "let-call",
        symbolTable: state.context.symbolTable,
        letToken: letToken,
        call,
        firstToken: letToken,
        lastToken: call.lastToken
    }
}

import { tExport, tPrivate } from "../tokenizer/token-type";
import type { Assignment } from "../tree/assignment";
import { parseCall } from "./parse-call";
import { ParserState } from "./parser-state";

export function parseAssignment(state: ParserState): Assignment {
    const firstToken = state.buffer.consumeToken()
    const modifier = [tExport, tPrivate].includes(firstToken.type) ? firstToken : null
    const variable = modifier === null ? firstToken : state.buffer.consumeToken()
    const operator = state.buffer.consumeToken()
    const call = parseCall(state)
    return {
        type: "assignment",
        modifier,
        variable,
        operator,
        call,
        firstToken: variable,
        lastToken: call.lastToken
    }
}

import { tExport, tPrivate, tScopedTypeIdentifier, tUnscopedTypeIdentifier } from "../tokenizer/token-type";
import type { TypeAssignment } from "../tree/type-assignment";
import { parseCall } from "./parse-call";
import { parseTypeCall } from "./parse-type-call";
import type { ParserState } from "./parser-state";

export function parseTypeAssignment(state: ParserState): TypeAssignment {
    const firstToken = state.buffer.consumeToken()
    const modifier = [tExport, tPrivate].includes(firstToken.type) ? firstToken : null
    const variable = modifier === null ? firstToken : state.buffer.consumeToken()
    const operator = state.buffer.consumeToken()

    const funcToken = state.buffer.peekToken()
    // TODO: Avoid null assertion
    const isTypeCall = [tScopedTypeIdentifier, tUnscopedTypeIdentifier].includes(funcToken!.type)
    const call = isTypeCall ? parseTypeCall(state) : parseCall(state)
    return {
        type: "type-assignment",
        modifier,
        variable,
        operator,
        call,
        firstToken: variable,
        lastToken: call.lastToken
    }
}

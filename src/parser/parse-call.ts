import assert from "assert";
import { tokenError } from "../compile-error";
import { tStatementTerminator } from "../tokenizer/token-type";
import type { Call } from "../tree/call";
import { parseArguable } from "./parse-arguable";
import { parseCallArgs } from "./parse-call-arguments";
import type { ParserState } from "./parser-state";

export function parseCall(state: ParserState): Call {
    const firstToken = state.buffer.peekToken()
    assert(firstToken !== null)

    const func = parseArguable(state)
    // TODO: Verify token type.

    const args = parseCallArgs(state);

    // TODO: This section of (commented) logic doesn't make sense. Can it be removed?
    // If we're immediately invoking a block, there's no reason (and readability suffers) for arguments to be allowed.
    // if (func.type === 'identifier') {
    //     // This case is fine. Aside from the awkwardness of this logic, nothing needs to change here.
    // } else if (func.type !== 'block' && func.type !== "call") {
    //     state.addError(tokenError(func.token, `${func.token.text} is called as if it were a function when it is not`))
    // } else {
    //     // TODO: What do we do with arguments here?
    // }

    // TODO: May want to be more precise here because this could give us an EndBlock
    const lastToken = state.buffer.getPreviousToken()
    if (state.buffer.peekToken().type === tStatementTerminator) {
        // Consume the statement separator.
        state.buffer.consumeToken()
    }

    return {
        type: "call",
        symbolTable: state.context.symbolTable,
        func,
        typeArgs: args.typeArgs,
        args: args.args,
        firstToken,
        lastToken
    }
}

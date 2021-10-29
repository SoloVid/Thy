import assert from "assert";
import { tBe, tComment, tEndBlock, tExport, tIs, tPrivate, tStartBlock, tStatementTerminator, tTo, tType, tYield } from "../tokenizer/token-type";
import type { Block } from "../tree/block";
import { parseAssignment } from "./parse-assignment";
import { parseCall } from "./parse-call";
import { parseTypeAssignment } from "./parse-type-assignment";
import { parseTypeCall } from "./parse-type-call";
import { parseYieldCall } from "./parse-yield-call";
import type { ParserState } from "./parser-state";

export function parseBlock(state: ParserState): Block {
    const ideas: (Block['ideas']) = []

    const firstToken = state.buffer.consumeToken()
    assert(firstToken.type === tStartBlock)

    let nextToken = state.buffer.peekToken()
    while (nextToken !== null && nextToken.type !== tEndBlock) {
        if (nextToken.type === tComment) {
            ideas.push({
                type: "non-code",
                token: state.buffer.consumeToken()
            })
            const separator = state.buffer.consumeToken()
            assert(separator.type === tStatementTerminator)
        } else if (nextToken.type === tStatementTerminator) {
            state.buffer.consumeToken()
            ideas.push({
                type: "blank-line"
            })
        } else if ([tExport, tPrivate].includes(nextToken.type)) {
            const afterToken = state.buffer.peekToken(1)
            // TODO: verify assumption
            if (afterToken!.type === tType) {
                ideas.push(parseTypeAssignment(state))
            } else {
                ideas.push(parseAssignment(state))
            }
        } else if (nextToken.type === tType) {
            const possiblyOperatorToken = state.buffer.peekToken(2)
            if (possiblyOperatorToken !== null && possiblyOperatorToken.type === tIs) {
                ideas.push(parseTypeAssignment(state))
            } else {
                ideas.push(parseTypeCall(state))
            }
        } else if (nextToken.type === tYield) {
            ideas.push(parseYieldCall(state))
        } else {
            const afterToken = state.buffer.peekToken(1)
            if (afterToken !== null && [tIs, tBe, tTo].includes(afterToken.type)) {
                ideas.push(parseAssignment(state))
            } else {
                ideas.push(parseCall(state))
            }
        }

        nextToken = state.buffer.peekToken()
    }

    const lastToken = state.buffer.consumeToken()
    assert(lastToken.type === tEndBlock)

    return {
        type: 'block',
        ideas: ideas,
        firstToken: firstToken,
        lastToken: lastToken
    }
}

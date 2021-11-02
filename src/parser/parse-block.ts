import assert from "assert";
import type { Token } from "../tokenizer/token";
import { tComment, tConstDeclAssign, tEndBlock, tExport, tNoDeclAssign, tPrivate, tStartBlock, tStatementTerminator, tType, tVarDeclAssign, tYield } from "../tokenizer/token-type";
import type { Block } from "../tree/block";
import { parseAssignment } from "./parse-assignment";
import { parseCall } from "./parse-call";
import { parseTypeAssignment } from "./parse-type-assignment";
import { parseTypeCall } from "./parse-type-call";
import { parseYieldCall } from "./parse-yield-call";
import type { ParserContext, ParserState } from "./parser-state";

export function parseBlock(state: ParserState): Block {
    const ideas: (Block['ideas']) = []

    const parentContext = state.context

    const thatStack = {
        indexThat: null as null | number,
        indexBeforeThat: null as null | number,
    }

    const context: ParserContext = {
        symbolTable: parentContext.symbolTable.makeChild(),
        takeThat() {
            const i = thatStack.indexThat
            if (i === null) {
                return null
            }
            thatStack.indexThat = null
            const idea = ideas.splice(i, 1)[0]
            assert(idea.type === 'call')
            return idea
        },
        takeBeforeThat() {
            const i = thatStack.indexBeforeThat
            if (i === null) {
                return null
            }
            thatStack.indexBeforeThat = null
            const idea = ideas.splice(i, 1)[0]
            if (thatStack.indexThat !== null) {
                thatStack.indexThat--
            }
            assert(idea.type === 'call')
            return idea
        }
    }
    state.context = context

    try {
        const firstToken = state.buffer.consumeToken()
        assert(firstToken.type === tStartBlock)

        let nextToken = state.buffer.peekToken()
        while (nextToken.type !== tEndBlock) {
            const idea = parseLine(state, nextToken)

            if (idea.type !== 'blank-line' && idea.type !== 'non-code') {
                if (idea.type === 'call') {
                    thatStack.indexBeforeThat = thatStack.indexThat
                    thatStack.indexThat = ideas.length
                } else {
                    thatStack.indexBeforeThat = null
                    thatStack.indexThat = null
                }
            }

            ideas.push(idea)
            nextToken = state.buffer.peekToken()
        }

        const lastToken = state.buffer.consumeToken()
        assert(lastToken.type === tEndBlock)

        return {
            type: 'block',
            symbolTable: context.symbolTable,
            ideas: ideas,
            firstToken: firstToken,
            lastToken: lastToken,
        }
    } finally {
        state.context = parentContext
    }
}

function parseLine(state: ParserState, nextToken: Token): Block['ideas'][number] {
    if (nextToken.type === tComment) {
        const idea = {
            type: "non-code",
            token: state.buffer.consumeToken()
        } as const
        const separator = state.buffer.consumeToken()
        assert(separator.type === tStatementTerminator)
        return idea
    } else if (nextToken.type === tStatementTerminator) {
        state.buffer.consumeToken()
        return {
            type: "blank-line"
        }
    } else if ([tExport, tPrivate].includes(nextToken.type)) {
        const afterToken = state.buffer.peekToken(1)
        if (afterToken.type === tType) {
            return parseTypeAssignment(state)
        } else {
            return parseAssignment(state)
        }
    } else if (nextToken.type === tType) {
        const afterToken = state.buffer.peekToken(1)
        if (afterToken.type === tEndBlock) {
            // TODO: Handle end of block immediately after `type`.
        }
        const possiblyOperatorToken = state.buffer.peekToken(2)
        if (possiblyOperatorToken.type === tConstDeclAssign) {
            return parseTypeAssignment(state)
        } else {
            return parseTypeCall(state)
        }
    } else if (nextToken.type === tYield) {
        return parseYieldCall(state)
    } else {
        const afterToken = state.buffer.peekToken(1)
        if ([tConstDeclAssign, tVarDeclAssign, tNoDeclAssign].includes(afterToken.type)) {
            return parseAssignment(state)
        } else {
            return parseCall(state)
        }
    }
}

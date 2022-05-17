import assert from "assert";
import { tokenError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tComment, tConstDeclAssign, tEndBlock, tExport, tNoDeclAssign, tPrivate, tStartBlock, tStatementTerminator, tType, tVarDeclAssign, tLet } from "../tokenizer/token-type";
import { Block, ReturnStyle, returnStyle } from "../tree/block";
import { parseAssignment } from "./parse-assignment";
import { parseCall } from "./parse-call";
import { parseTypeAssignment } from "./parse-type-assignment";
import { parseTypeCall } from "./parse-type-call";
import { parseLetCall } from "./parse-let-call";
import { ParserContext, ParserState, thatAlreadyUsed, thatNotFound } from "./parser-state";

export const returnKeyword = "return"
export const allowReturnKeyword = "let"
export const throwKeyword = "throw"
export const awaitKeyword = "await"

export function parseBlock(state: ParserState): Block {
    const ideas: (Block['ideas']) = []

    const parentContext = state.context

    const thatStack = {
        thatTaken: null as Token | null,
        indexThat: null as null | number,
        beforeThatTaken: null as Token | null,
        indexBeforeThat: null as null | number,
    }

    let blockReturnStyle: ReturnStyle = returnStyle.implicitExport

    const context: ParserContext = {
        symbolTable: parentContext.symbolTable.makeChild(),
        takeThat(thatToken) {
            if (thatStack.thatTaken !== null) {
                return thatAlreadyUsed
            }
            const i = thatStack.indexThat
            if (i === null) {
                return thatNotFound
            }
            thatStack.thatTaken = thatToken
            thatStack.indexThat = null
            const idea = ideas.splice(i, 1)[0]
            assert(idea.type === 'call')
            return idea
        },
        takeBeforeThat(beforeThatToken) {
            if (thatStack.beforeThatTaken !== null) {
                return thatAlreadyUsed
            }
            const i = thatStack.indexBeforeThat
            if (i === null) {
                return thatNotFound
            }
            thatStack.beforeThatTaken = beforeThatToken
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

            // Figure return style from most recent line.
            // TODO: Handle all cases of return style. let/let is one not covered.
            // TODO: Do we really care about the return style here?
            if (idea.type === "call" && idea.func.type === "atom") {
                if (idea.func.token.text === awaitKeyword) {
                    if (blockReturnStyle === returnStyle.explicitExport) {
                        state.addError(tokenError(idea.func.token, `await is incompatible with export-style return`))
                    }
                    blockReturnStyle = returnStyle.asyncReturn
                } else if (idea.func.token.text === returnKeyword) {
                    if (blockReturnStyle === returnStyle.explicitExport) {
                        state.addError(tokenError(idea.func.token, `Explicit return is incompatible with export-style return`))
                    }
                    if (blockReturnStyle !== returnStyle.asyncReturn) {
                        blockReturnStyle = returnStyle.explicitReturn
                    }
                }
            } else if (idea.type === "assignment") {
                if (idea.modifier?.text === "export") {
                    if (blockReturnStyle === returnStyle.explicitReturn) {
                        state.addError(tokenError(idea.modifier, `export is incompatible with explicit return`))
                    } else if (blockReturnStyle === returnStyle.asyncReturn) {
                        state.addError(tokenError(idea.modifier, `export is incompatible with await`))
                    } else {
                        blockReturnStyle = returnStyle.explicitExport
                    }
                }
                if (idea.call.func.type === "atom" && idea.call.func.token.text === awaitKeyword) {
                    if (blockReturnStyle === returnStyle.explicitExport) {
                        state.addError(tokenError(idea.call.func.token, `await is incompatible with export-style return`))
                    }
                    blockReturnStyle = returnStyle.asyncReturn
                }
            }

            if (idea.type !== 'blank-line' && idea.type !== 'non-code') {

                if (thatStack.beforeThatTaken !== null && thatStack.thatTaken === null) {
                    state.addError(tokenError(thatStack.beforeThatTaken, `beforeThat used without that`))
                }
                thatStack.thatTaken = null
                thatStack.beforeThatTaken = null

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
            returnStyle: blockReturnStyle,
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
            symbolTable: state.context.symbolTable,
            token: state.buffer.consumeToken(),
        } as const
        const separator = state.buffer.consumeToken()
        assert(separator.type === tStatementTerminator)
        return idea
    } else if (nextToken.type === tStatementTerminator) {
        state.buffer.consumeToken()
        return {
            type: "blank-line",
            symbolTable: state.context.symbolTable,
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
    } else if (nextToken.type === tLet) {
        return parseLetCall(state)
    } else {
        const afterToken = state.buffer.peekToken(1)
        if ([tConstDeclAssign, tVarDeclAssign, tNoDeclAssign].includes(afterToken.type)) {
            return parseAssignment(state)
        } else {
            return parseCall(state)
        }
    }
}

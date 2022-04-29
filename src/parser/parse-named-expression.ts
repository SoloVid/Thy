import assert from "assert";
import { tokenError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tMemberAccessOperator, tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom, Call, PropertyAccess, TokenRange } from "../tree";
import { ParserState, thatAlreadyUsed, thatNotFound } from "./parser-state";

type PossibleReturn = Atom | PropertyAccess

export function parseNamedExpression(state: ParserState): PossibleReturn {
    const pureIdentifier = parseNamedExpressionVanilla(state)
    return translateThat(state, pureIdentifier)
}

interface NamedExpression extends TokenRange {
    atoms: Atom[]
    memberAccessOperatorTokens: Token<typeof tMemberAccessOperator>[]
    rawTokens: Token[]
}

function parseNamedExpressionVanilla(state: ParserState): NamedExpression {
    const rawTokens: Token[] = []
    const firstToken = state.buffer.consumeToken()
    rawTokens.push(firstToken)
    // TODO: Errors instead of asserts.
    assert(firstToken.type === tTypeIdentifier || firstToken.type === tValueIdentifier)

    const significantTokens: Token[] = [firstToken]
    const memberAccessOperatorTokens: Token<typeof tMemberAccessOperator>[] = []
    let nextToken = state.buffer.peekToken()
    while (nextToken.type === tMemberAccessOperator) {
        const maoToken = state.buffer.consumeToken()
        // TODO: check first?
        memberAccessOperatorTokens.push(maoToken)
        rawTokens.push(maoToken)
        const nextNameToken = state.buffer.peekToken()
        if (![tTypeIdentifier, tValueIdentifier].includes(nextNameToken.type)) {
            state.addError(tokenError(maoToken, `Dangling member access operator`))
            // TODO: break loop without `break`
            break
        } else {
            const lastNameToken = state.buffer.consumeToken()
            significantTokens.push(lastNameToken)
            rawTokens.push(lastNameToken)
            nextToken = state.buffer.peekToken()
        }
    }

    for (const s of significantTokens.slice(0, significantTokens.length - 1)) {
        if (s.type !== tValueIdentifier) {
            state.addError(tokenError(s, `"${s.text}" is used as a value for scoping when it is not`))
        }
    }

    return {
        atoms: significantTokens.map(t => ({ type: "atom", token: t })),
        memberAccessOperatorTokens: memberAccessOperatorTokens,
        rawTokens: rawTokens,
        firstToken: firstToken,
        lastToken: significantTokens[significantTokens.length - 1]
    }
}

function translateThat(state: ParserState, node: NamedExpression): PossibleReturn {
    assert(node.atoms.length >= 1)

    type PropertyPair = readonly [Token<typeof tMemberAccessOperator>, Atom]
    let transformedAtoms: [(Call | Atom), ...PropertyPair[]] = [
        node.atoms[0],
        ...node.atoms.slice(1).map((a, i) => [node.memberAccessOperatorTokens[i], a] as const)
    ]

    function getThatCall(thatToken: Token): Call | Atom {
        const thatCall = state.context.takeThat(thatToken)
        if (thatCall === thatNotFound) {
            state.addError(tokenError(thatToken, `No preceding call is eligible to satisfy that`))
            return { type: 'atom', token: thatToken }
        } else if (thatCall === thatAlreadyUsed) {
            state.addError(tokenError(thatToken, `that already used`))
            return { type: 'atom', token: thatToken }
        } else {
            return thatCall
        }
    }

    function getBeforeThatCall(beforeThatToken: Token): Call | Atom {
        const beforeThatCall = state.context.takeBeforeThat(beforeThatToken)
        if (beforeThatCall === thatNotFound) {
            state.addError(tokenError(beforeThatToken, `No preceding call is eligible to satisfy beforeThat`))
            return { type: 'atom', token: beforeThatToken }
        } else if (beforeThatCall === thatAlreadyUsed) {
            state.addError(tokenError(beforeThatToken, `beforeThat already used`))
            return { type: 'atom', token: beforeThatToken }
        } else {
            return beforeThatCall
        }
    }

    for (const a of node.atoms.slice(1)) {
        if (a.token.text === 'that') {
            state.addError(tokenError(a.token, 'that cannot be scoped'))
        }
        if (a.token.text === 'beforeThat') {
            state.addError(tokenError(a.token, 'beforeThat cannot be scoped'))
        }
    }

    if (node.atoms[0].token.text === 'that') {
        const thatCall = getThatCall(node.atoms[0].token)
        transformedAtoms[0] = thatCall
    }
    if (node.atoms[0].token.text === 'beforeThat') {
        const beforeThatCall = getBeforeThatCall(node.atoms[0].token)
        transformedAtoms[0] = beforeThatCall
    }

    const justTrailingAtoms = transformedAtoms.slice(1) as readonly PropertyPair[]
    return justTrailingAtoms.reduce((output, part, i) => {
        const propertyAccess: PropertyAccess = {
            type: "property-access",
            base: output,
            memberAccessOperatorToken: part[0],
            property: part[1].token,
            firstToken: output.type === "atom" ? output.token : output.firstToken,
            lastToken: part[1].token,
        }
        return propertyAccess
    }, transformedAtoms[0] as PossibleReturn)
}

import { tokenError } from "../../../compile-error";
import type { Call } from "../../../tree/call";
import { nodeError } from "../../../tree/tree-node";
import { fromComplicated, fromToken, GeneratedSnippets } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import { makeIndent } from "../../indent-string";
import { generateBlockLinesTs } from "../block/generate-block-ts";
import { generateTs } from "../generate-ts";

export function tryGenerateIfTs(node: Call, state: GeneratorState): void | GeneratedSnippets {
    // TODO: We're now wrapping stuff in identifiers, so this and some other stuff is broke.
    if (node.func.type !== "identifier") {
        return
    }
    // TODO: Handle scopes for if?
    if (node.func.target.text !== "if") {
        return
    }
    const ifSnippet = fromToken(node.func.target, "if")

    if (node.args.length < 2) {
        state.addError(tokenError(node.func.target, "if requires at least two arguments: 1) condition and 2) callback"))
    }

    const elseLiteral = node.args.length > 2 ? node.args[2] : null

    if (elseLiteral !== null) {
        if (elseLiteral.type !== "identifier" || elseLiteral.scopes.length !== 0 || elseLiteral.target.text !== "else") {
            state.addError(nodeError(elseLiteral, `Expected "else"`))
        }

        if (node.args.length === 3) {
            state.addError(nodeError(elseLiteral, `Missing else case (should be one more argument)`))
        }
    }

    if (node.args.length > 4) {
        for (const arg of node.args.slice(4)) {
            state.addError(nodeError(arg, `if cannot take this many arguments`))
        }
    }

    // TODO: Check type parameters etc.

    function buildIf() {
        const trueCaseNode = node.args.length > 1 ? node.args[1] : null
        const elseCaseNode = node.args.length > 3 ? node.args[3] : null

        const requiresBlockSyntax = (trueCaseNode !== null && trueCaseNode.type === "block") ||
            (elseCaseNode !== null && elseCaseNode.type === "block")
        // TODO: Is there really a dominant case where mightReturn could be false? Implicit exports make most blocks return.
        const mightReturn = true
        // const mightReturn = (trueCaseNode !== null && trueCaseNode.type === "block" && mightAffectReturn(trueCaseNode)) ||
        //     (elseCaseNode !== null && elseCaseNode.type === "block" && mightAffectReturn(elseCaseNode))

        if (state.isExpressionContext()) {
            if (!requiresBlockSyntax) {
                return buildTernary()
            }
        } else {
            if (state.context === contextType.blockAllowingReturn || !mightReturn) {
                return buildIfStatement()
            }
        }

        return buildIfExpression()
    }

    function buildTernary() {
        const baseTernary = fromComplicated(node, [
            generateCondition(),
            " ? ",
            generateTrueCase(),
            " : ",
            generateFalseCase()
        ])

        if (state.context === contextType.looseExpression) {
            return fromComplicated(node, ["(", baseTernary, ")"])
        }
        return baseTernary
    }

    function buildIfStatement() {
        const ifFirstHalf = fromComplicated(node, [
            ifSnippet, " (", generateCondition(), ") {\n",
            generateTrueCase(),
            makeIndent(state.indentLevel), "}"
        ])
        if (node.args.length >= 3) {
            return fromComplicated(node, [
                ifFirstHalf,
                " else {\n",
                generateFalseCase(),
                makeIndent(state.indentLevel), "}"
            ])
        }
        return ifFirstHalf
    }

    function buildIfExpression() {
        return fromComplicated(node, ["(() => {", buildIfStatement(), "})()"])
    }

    function generateCondition() {
        if (node.args.length === 0) {
            return "false"
        }
        return generateTs(node.args[0], state.makeChild({
            context: contextType.looseExpression
        }))
    }

    function generateTrueCase() {
        if (node.args.length < 2) {
            return ""
        }
        const trueCaseNode = node.args[1]
        if (trueCaseNode.type === "block") {
            return generateBlockLinesTs(trueCaseNode, trueCaseNode.ideas, state.makeChild({
                indentLevel: state.indentLevel + 1
            }))
        } else {
            return fromComplicated(node, [
                generateTs(trueCaseNode, state.makeChild({ context: contextType.isolatedExpression })),
                "()"
            ])
        }
    }

    function generateFalseCase() {
        if (node.args.length < 4) {
            return ""
        }
        const elseCaseNode = node.args[3]
        if (elseCaseNode.type === "block") {
            return generateBlockLinesTs(elseCaseNode, elseCaseNode.ideas, state.makeChild({
                indentLevel: state.indentLevel + 1
            }))
        } else {
            return fromComplicated(node, [
                generateTs(elseCaseNode, state.makeChild({ context: contextType.isolatedExpression })),
                "()"
            ])
        }
    }

    return buildIf()
}

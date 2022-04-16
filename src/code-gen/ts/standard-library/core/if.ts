import { tokenError } from "../../../../compile-error";
import type { Call } from "../../../../tree/call";
import { nodeError } from "../../../../tree/tree-node";
import { fromComplicated, fromToken, GeneratedSnippets, GeneratorFixture } from "../../../generator";
import type { GeneratorForGlobalSpec, SimpleCall } from "../../../generator-for-global";
import { ContextType, contextType, GeneratorState } from "../../../generator-state";
import { genIndent, makeIndent } from "../../../indent-string";
import { generateBlockLinesTs } from "../../block/generate-block-ts";
import { autoTightS } from "../helpers/auto-tight";

export const ifGenerator: GeneratorForGlobalSpec = {
    name: "if",
    generateValue(state) {
        const space = makeIndent(state.indentLevel)
        const space2 = makeIndent(state.indentLevel + 1)
        const space3 = makeIndent(state.indentLevel + 2)
        return autoTightS(state, `<_T>(condition: boolean, trueCallback: () => _T, elseLiteral?: \"else\", falseCallback?: () => _T) => {
${space2}if (condition) {
${space3}trueCallback()
${space2}} else if (falseCallback) {
${space3}falseCallback()
${space2}}
${space}}`)
    },
    generateCall(node, state, fixture) {
        return tryGenerateIfTs(node, state, fixture)
    },
    generateLetCall(node, state, fixture) {
        return tryGenerateIfTs(node.call, state.makeChild({ context: contextType.blockAllowingReturn }), fixture)
    }
}

function tryGenerateIfTs(node: SimpleCall, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets {
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

    for (const arg of node.args.slice(4)) {
        state.addError(nodeError(arg, `if cannot take more than 4 arguments`))
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
            if (state.context === contextType.blockAllowingReturn || state.context === contextType.blockAllowingExport || !mightReturn) {
                return buildIfStatement()
            }
        }

        return buildIfExpression()
    }

    function buildTernary() {
        const baseTernary = fromComplicated(node, [
            generateCondition(contextType.looseExpression),
            " ? ",
            generateTrueCase(true),
            " : ",
            generateFalseCase(true)
        ])

        if (state.context === contextType.looseExpression) {
            return fromComplicated(node, ["(", baseTernary, ")"])
        }
        return baseTernary
    }

    function buildIfStatement() {
        const ifFirstHalf = fromComplicated(node, [
            ifSnippet, " (", generateCondition(contextType.isolatedExpression), ") {\n",
            generateTrueCase(false),
            makeIndent(state.indentLevel), "}"
        ])
        if (node.args.length >= 3) {
            return fromComplicated(node, [
                ifFirstHalf,
                " else {\n",
                generateFalseCase(false),
                makeIndent(state.indentLevel), "}"
            ])
        }
        return ifFirstHalf
    }

    function buildIfExpression() {
        return fromComplicated(node, ["(() => {", buildIfStatement(), "})()"])
    }

    function generateCondition(context: ContextType) {
        if (node.args.length === 0) {
            return "false"
        }
        return fixture.generate(node.args[0], state.makeChild({
            context: context
        }))
    }

    function generateTrueCase(allowNoWhitespace: boolean) {
        if (node.args.length < 2) {
            return ""
        }
        const trueCaseNode = node.args[1]
        if (trueCaseNode.type === "block") {
            return generateBlockLinesTs(trueCaseNode, trueCaseNode.ideas, state.makeChild({
                context: contextType.blockAllowingReturn,
                indentLevel: state.indentLevel + 1
            }), fixture)
        } else {
            const basicParts = [
                fixture.generate(trueCaseNode, state.makeChild({ context: contextType.isolatedExpression })),
                "()"
            ]
            const allParts = allowNoWhitespace ? basicParts : [genIndent(state.indentLevel + 1), ...basicParts, "\n"]
            return fromComplicated(node, allParts)
        }
    }

    function generateFalseCase(allowNoWhitespace: boolean) {
        if (node.args.length < 4) {
            return ""
        }
        const elseCaseNode = node.args[3]
        if (elseCaseNode.type === "block") {
            return generateBlockLinesTs(elseCaseNode, elseCaseNode.ideas, state.makeChild({
                context: contextType.blockAllowingReturn,
                indentLevel: state.indentLevel + 1
            }), fixture)
        } else {
            const basicParts = [
                fixture.generate(elseCaseNode, state.makeChild({ context: contextType.isolatedExpression })),
                "()"
            ]
            const allParts = allowNoWhitespace ? basicParts : [genIndent(state.indentLevel + 1), ...basicParts, "\n"]
            return fromComplicated(node, allParts)
        }
    }

    return buildIf()
}

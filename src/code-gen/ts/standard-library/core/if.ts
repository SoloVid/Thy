import { nodeError } from "common"
import { GeneratedSnippets } from "../../../generator"
import { GeneratorFixture } from "../../ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { GeneratorForNameSpec } from "../../generator-for-name"
import { GeneratorState } from "../../generator-state"
import { ContextType } from "code-gen/ts/generator-context"
import { contextType } from "code-gen/ts/generator-context"
import { genIndent, makeIndent } from "../../../utils/indent"
import { generateBlockLinesTs } from "../../block/generate-block-lines-ts"
import { autoTightS } from "../../utils/auto-tight"
import { ValueCall } from "tree"
import { addErrorForExcessArgs } from "../helpers/too-many-args-error"
import assert from "utils/assert"

export const ifGenerator: GeneratorForNameSpec = {
  name: "if",
  generateCall(node, state, fixture) {
    return tryGenerateIfTs(node, state, fixture)
  },
  generateLetCall(node, state, fixture) {
    return tryGenerateIfTs(
      node.call,
      state.makeChild({ context: contextType.blockAllowingReturn }),
      fixture,
    )
  },
}

function tryGenerateIfTs(
  node: ValueCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.args.length < 2) {
    return
  }
  if (node.typeArgs.length > 0) {
    return
  }

  const elseLiteral = node.args.length > 2 ? node.args[2] : null

  if (elseLiteral !== null) {
    if (
      elseLiteral.type !== "value-identifier" ||
      elseLiteral.token.text !== "else"
    ) {
      state.addError(nodeError(elseLiteral, `Expected "else"`))
    }

    if (node.args.length === 3) {
      state.addError(
        nodeError(
          elseLiteral,
          `Missing else case (should be one more argument)`,
        ),
      )
    }
  }

  addErrorForExcessArgs(node, state, "if", 4, 1)
  for (const arg of node.args.slice(4)) {
    state.addError(nodeError(arg, `if cannot take more than 4 arguments`))
  }

  const trueCaseNode = node.args.length > 1 ? node.args[1] : null
  const elseCaseNode = node.args.length > 3 ? node.args[3] : null

  const requiresBlockSyntax =
    (trueCaseNode !== null && trueCaseNode.type === "block") ||
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

  function buildTernary() {
    const baseTernary = fromComplicated(node, [
      generateCondition(contextType.looseExpression),
      " ? ",
      generateTrueCase(true),
      " : ",
      generateFalseCase(true),
    ])

    if (state.context === contextType.looseExpression) {
      return fromComplicated(node, ["(", baseTernary, ")"])
    }
    return baseTernary
  }

  function buildIfStatement() {
    const ifFirstHalf = fromComplicated(node, [
      fromNode(node.func, "if"),
      " (",
      generateCondition(contextType.isolatedExpression),
      ") {\n",
      generateTrueCase(false),
      makeIndent(state.indentLevel),
      "}",
    ])
    if (node.args.length >= 3) {
      return fromComplicated(node, [
        ifFirstHalf,
        " else {\n",
        generateFalseCase(false),
        makeIndent(state.indentLevel),
        "}",
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
    return fixture.generate(
      node.args[0],
      state.makeChild({
        context: context,
      }),
    )
  }

  function generateTrueCase(allowNoWhitespace: boolean) {
    assert(!!trueCaseNode, "trueCaseNode should not be null")
    if (trueCaseNode.type === "block") {
      return generateBlockLinesTs(
        trueCaseNode,
        trueCaseNode.ideas,
        state.makeChild({
          context: contextType.blockAllowingReturn,
          increaseIndent: true,
        }),
        fixture,
      )
    } else {
      const basicParts = [
        fixture.generate(
          trueCaseNode,
          state.makeChild({ context: contextType.isolatedExpression }),
        ),
        "()",
      ]
      const allParts = allowNoWhitespace
        ? basicParts
        : [genIndent(state.indentLevel + 1), ...basicParts, "\n"]
      return fromComplicated(node, allParts)
    }
  }

  function generateFalseCase(allowNoWhitespace: boolean) {
    if (!elseCaseNode) {
      return ""
    }
    if (elseCaseNode.type === "block") {
      return generateBlockLinesTs(
        elseCaseNode,
        elseCaseNode.ideas,
        state.makeChild({
          context: contextType.blockAllowingReturn,
          increaseIndent: true,
        }),
        fixture,
      )
    } else {
      const basicParts = [
        fixture.generate(
          elseCaseNode,
          state.makeChild({ context: contextType.isolatedExpression }),
        ),
        "()",
      ]
      const allParts = allowNoWhitespace
        ? basicParts
        : [genIndent(state.indentLevel + 1), ...basicParts, "\n"]
      return fromComplicated(node, allParts)
    }
  }
}

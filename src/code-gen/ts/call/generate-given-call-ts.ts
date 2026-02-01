import type { GeneratorFixture } from "code-gen/ts/ts-generator.ts"
import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { fromNode } from "code-gen/utils/from-node.ts"
import { nodeError } from "common"
import type { GivenCall, TreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import type { GeneratorState } from "../generator-state.ts"
import { generateTypeTsForFunctionSignature } from "../type/generate-type-ts-for-function-signature.ts"

export function tryGenerateGivenCallTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "given-call") {
    return generateGivenCallTs(node, state, fixture)
  }
}

export function generateGivenCallTs(
  node: GivenCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  // We're going to use a different name for the actual parameter than the variable in the block.
  const tempParam = state.getUniqueVariableName()
  return generateGivenCallTsWithParameterName(node, state, fixture, tempParam)
}

export function generateGivenCallTsWithParameterName(
  node: GivenCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
  parameterName: string,
): GeneratedSnippets {
  if (state.block === null) {
    state.addError(
      nodeError(node, "Parameter (given) cannot be specified in this context"),
    )
    return fromNode(node, "undefined")
  }

  const givenTerm = node.func
  const typeNode = node.typeArgs[0]
  const defaultValueNode = node.args[0]

  const parameterNameSnippet = fromNode(node, parameterName)
  const parameterSnippets = typeNode === undefined
    ? parameterNameSnippet
    : fromComplicated(node, [
      parameterNameSnippet,
      ": ",
      generateTypeTsForFunctionSignature(
        typeNode,
        state,
        fixture,
        parameterName,
      ),
    ])
  state.block.parametersSoFar.push({
    inlineSnippet: parameterSnippets,
  })

  if (defaultValueNode === undefined) {
    return fromNode(givenTerm, parameterName)
  }
  return fromComplicated(node, [
    `${parameterName} === undefined ? ${
      fixture.generate(defaultValueNode, state)
    } : ${parameterName}`,
  ])
}

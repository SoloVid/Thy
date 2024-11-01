import type { GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { GivenCall, TreeNode } from "tree"
import type {
  GeneratedSnippets,
} from "../../generator"
import type { GeneratorState } from "../generator-state"
import { generateTypeTsForFunctionSignature } from "../type/generate-type-ts-for-function-signature"

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
  const givenTerm = node.func
  const typeNode = node.typeArgs[0]
  const defaultValueNode = node.args[0]

  const parameterNameSnippet = fromNode(node, parameterName)
  const parameterSnippets = typeNode === undefined ? parameterNameSnippet : fromComplicated(node, [
    parameterNameSnippet,
    ": ",
    generateTypeTsForFunctionSignature(typeNode, state, fixture, parameterName),
  ])
  state.blockParametersSoFar.push({
    inlineSnippet: parameterSnippets
  })

  if (defaultValueNode === undefined) {
    return fromNode(givenTerm, parameterName)
  }
  return fromComplicated(node, [
    `${parameterName} === undefined ? ${fixture.generate(defaultValueNode, state)} : ${parameterName}`
  ])
}

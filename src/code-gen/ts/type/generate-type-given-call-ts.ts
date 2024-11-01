import type { GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import type { TreeNode, TypeGivenCall } from "tree"
import type {
  GeneratedSnippets,
} from "../../generator"
import type { GeneratorState } from "../generator-state"
import { generateTypeTsForFunctionSignature } from "./generate-type-ts-for-function-signature"

export function tryGenerateTypeGivenCallTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "type-given-call") {
    return generateTypeGivenCallTypeTs(node, state, fixture)
  }
}

export function generateTypeGivenCallTypeTs(
  node: TypeGivenCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  // We're going to use a different name for the actual parameter than the variable in the block.
  const tempParam = state.getUniqueVariableName()
  return generateTypeGivenCallTypeTsWithParameterName(node, state, fixture, tempParam)
}

export function generateTypeGivenCallTypeTsWithParameterName(
  node: TypeGivenCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
  parameterName: string,
): GeneratedSnippets {
  const extendsTypeNode = node.args[0]
  const extendsTypeSnippets = extendsTypeNode === undefined ? fromNode(node, "unknown") : generateTypeTsForFunctionSignature(extendsTypeNode, state, fixture, parameterName)

  const defaultTypeNode = node.args[1]
  const defaultTypeSnippets = defaultTypeNode === undefined ? extendsTypeSnippets : generateTypeTsForFunctionSignature(defaultTypeNode, state, fixture, `${parameterName}_Default`)

  state.blockTypeParametersSoFar.push({
    name: parameterName,
    inlineSnippet: fromComplicated(node, [
      `${parameterName} extends `, extendsTypeSnippets, ` = `, defaultTypeSnippets
    ])
  })

  return fromNode(node, parameterName)
}

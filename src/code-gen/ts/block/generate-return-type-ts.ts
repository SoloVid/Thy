import type { GeneratorFixture } from "code-gen/ts/ts-generator"
import type { Return, TreeNode, TypeExpression, TypeReturn } from "tree"
import type {
  GeneratedSnippets,
} from "../../generator"
import type { GeneratorState } from "../generator-state"
import { generateTypeTsForFunctionSignature } from "../type/generate-type-ts-for-function-signature"

export function tryGenerateReturnTypeTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets | void {
  if (node.type !== "type-return" && !isReturnWithExplicitType(node)) {
    return
  }
  return generateReturnTypeTs(node, state, fixture)
}

function isReturnWithExplicitType(
  node: TreeNode
): node is ReturnWithExplicitType {
  return node.type === "return" && node.typeArgs.length !== 0
}

type ReturnWithExplicitType = Return & {
  readonly typeArgs: readonly [TypeExpression]
}

export function generateReturnTypeTs(
  node: TypeReturn | ReturnWithExplicitType,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const typeNode = node.type === "type-return" ? node.args[0] : node.typeArgs[0]
  return generateTypeTsForFunctionSignature(typeNode, state, fixture, state.getUniqueVariableName())
}

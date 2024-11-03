import type { TreeNode } from "tree"
import assert from "utils/assert"
import type { GeneratedSnippets } from "../../generator"
import type { GeneratorState } from "../generator-state"
import type { GeneratorFixture } from "../ts-generator"
import { makeParameterTypePackage } from "./parameter-type-package"

export function generateTypeTsForFunctionSignature(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
  nameBase: string,
): GeneratedSnippets {
  assert(
    state.block !== null,
    "generateTypeTsForFunctionSignature() should only be called in a block",
  )
  // This is the generated code for the type expression as literally written,
  // not accounting for any dependencies.
  const leafValueSnippets = fixture.generate(node, state)
  // We feed this type into makeParameterTypePackage() because it needs
  // to wrap up preceding lines into a type we can actually consume
  // in the function signature.
  const typePackage = makeParameterTypePackage(
    node,
    state,
    fixture,
    nameBase,
    leafValueSnippets,
  )
  state.block.preStatementGenerators.push(typePackage.preStatementGenerator)
  return typePackage.tsType
}

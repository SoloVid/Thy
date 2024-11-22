import type { TreeNode } from "tree"
import assert from "utils/assert"
import type { GeneratedSnippets } from "../../generator"
import type { GeneratorState } from "../generator-state"
import type { GeneratorFixture } from "../ts-generator"
import { makeParameterTypePackage } from "./parameter-type-package"
import { contextType } from "../generator-context"

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
  // For simple type identifiers, we can take a simple approach.
  if (node.type === "type-identifier") {
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })
    // Types from standard library should be generated in simple fashion.
    const stdLibGenerated = fixture.standardLibrary.typeIdentifierGenerator(
      node,
      childState,
      fixture,
    )
    if (stdLibGenerated) {
      return stdLibGenerated
    }
    // TODO: If the symbol can be found in the parent block,
    // it won't require generating extra stuff prior to the function signature.
    if (!state.symbolTable?.localSymbols.has(node.token.text)) {
      return fixture.generateAsType(node, childState)
    }
  }
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

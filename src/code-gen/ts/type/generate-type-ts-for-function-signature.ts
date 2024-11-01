import type { GeneratedSnippets, GeneratorFixture } from "code-gen/generator";
import type { GeneratorState } from "code-gen/generator-state";
import type { Expression, TypeExpression } from "tree";
import { makeParameterTypePackage } from "./parameter-type-package";

export function generateTypeTsForFunctionSignature(
  node: TypeExpression | Expression,
  state: GeneratorState,
  fixture: GeneratorFixture,
  nameBase: string): GeneratedSnippets {
  // This is the generated code for the type expression as literally written,
  // not accounting for any dependencies.
  const inlineTypeSnippets = fixture.generate(node, state)
  // We feed this type into makeParameterTypePackage() because it needs
  // to wrap up preceding lines into a type we can actually consume
  // in the function signature.
  const typePackage = makeParameterTypePackage(node, state, fixture, nameBase, inlineTypeSnippets)
  state.blockPreStatementGenerators.push(typePackage.preStatementGenerator)
  return typePackage.tsType
}

import { TypePropertyAccess, ValuePropertyAccess } from "tree"
import type { Token } from "../../tokenizer/token"
import { tMemberAccessOperator } from "../../tokenizer/token-type"
import type { TreeNode } from "../../tree/tree-node"
import { makeGenerator } from "../generate-from-options"
import {
  CodeGeneratorFunc,
  GeneratedSnippets,
  GeneratorFixture,
} from "../generator"
import { fromToken } from "code-gen/utils/from-token"
import type { GeneratorState } from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"

export function propertyAccessGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makePropertyAccessTsGenerator([
    standardLibrary.propertyAccessGenerator,
  ])
}

export function makePropertyAccessTsGenerator(
  specializations: CodeGeneratorFunc<ValuePropertyAccess>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "value-property-access") {
        return node
      }
    },
    generatePropertyAccessTs,
    specializations,
  )
}

export function generatePropertyAccessTs(
  node: ValuePropertyAccess | TypePropertyAccess,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const baseGenerated = fixture.generate(node.base, state)
  const tailGenerated = fillOutPropertyAccessExpression(
    node.propertyAccesses
      .map((pa) => [pa.memberAccessOperatorToken, pa.propertyToken])
      .flat(),
  )
  return [baseGenerated, tailGenerated]
}

export function fillOutPropertyAccessExpression(
  trailingTokens: readonly Token[],
): GeneratedSnippets {
  return trailingTokens.map((t) => {
    if (t.type === tMemberAccessOperator) {
      return fromToken(t, ".")
    }
    return fromToken(t)
  })
}

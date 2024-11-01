import { GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromNode } from "code-gen/utils/from-node"
import { fromToken } from "code-gen/utils/from-token"
import { nodeError } from "common/compile-error"
import type {
  TreeNode,
  TypeIdentifier,
  TypePropertyAccess,
  ValueIdentifier,
  ValuePropertyAccess,
} from "tree"
import {
  GeneratedSnippets,
} from "../../generator"
import { generatePropertyAccessTs } from "../expression/generate-property-access-ts"
import type { GeneratorState } from "../generator-state"

// export function typeInstanceGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
//     return makeTypeInstanceTsGenerator([
//         standardLibrary.typeInstanceGenerator,
//     ])
// }

// export function makeTypeInstanceTsGenerator(specializations: CodeGeneratorFunc<Atom | PropertyAccess<never>>[]): CodeGeneratorFunc<TreeNode> {
//     return makeGenerator((node) => {
//         if (node.type === "atom" || node.type === "property-access") {
//             return node
//         }
//     }, generateTypeInstanceTs, specializations)
// }

export function checkAndGenerateTypeInstanceTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  if (
    node.type !== "value-identifier" &&
    node.type !== "value-property-access" &&
    node.type !== "type-identifier" &&
    node.type !== "type-property-access"
  ) {
    state.addError(nodeError(node, "Expected type instance"))
    return fromNode(node, "unknown")
  }
  return generateTypeInstanceTs(node, state, fixture)
}

export function generateTypeInstanceTs(
  node:
    | ValueIdentifier
    | ValuePropertyAccess
    | TypeIdentifier
    | TypePropertyAccess,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  const fromStandardLib = fixture.standardLibrary.typeInstanceGenerator(
    node,
    state,
    fixture,
  )
  if (fromStandardLib !== undefined) {
    return fromStandardLib
  }

  if (node.type === "value-identifier" || node.type === "type-identifier") {
    return [fromToken(node.token, "typeof "), fixture.generate(node, state)]
  }
  return fromComplicated(node, [
    "typeof ",
    generatePropertyAccessTs(node, state, fixture),
  ])
}

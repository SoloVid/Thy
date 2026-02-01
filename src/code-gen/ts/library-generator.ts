// deno-lint-ignore-file no-explicit-any
import type {
  Assignment,
  LetCall,
  TypeAssignment,
  TypeCall,
  TypeIdentifier,
  ValueCall,
  ValueIdentifier,
  ValuePropertyAccess,
} from "tree"
import { fromNode } from "../utils/from-node.ts"
import type { SpecialValueIdentifier } from "./expression/generate-value-identifier-ts.ts"
import type {
  GeneratorForNameParentSpec,
  GeneratorForNameSpec,
} from "./generator-for-name.ts"
import { makeSpecMap, tryLookupNamedNode } from "./generator-lookup.ts"
import type { CodeGeneratorFunc } from "./ts-generator.ts"

export interface LibraryGeneratorCollection {
  valueIdentifierGenerator: CodeGeneratorFunc<
    ValueIdentifier | SpecialValueIdentifier | ValuePropertyAccess
  >
  typeIdentifierGenerator: CodeGeneratorFunc<TypeIdentifier>
  callGenerator: CodeGeneratorFunc<ValueCall>
  assignmentGenerator: CodeGeneratorFunc<Assignment>
  letCallGenerator: CodeGeneratorFunc<LetCall>
  typeCallGenerator: CodeGeneratorFunc<TypeCall>
  typeAssignmentGenerator: CodeGeneratorFunc<TypeAssignment>
}

export function makeLibraryGenerators(
  specs: (GeneratorForNameSpec | GeneratorForNameParentSpec)[],
): LibraryGeneratorCollection {
  const valueSpecMap = makeSpecMap(specs, "generateValue")
  const typeSpecMap = makeSpecMap(specs, "generateTypeInstance")
  const callSpecMap = makeSpecMap(specs, "generateCall")
  const assignmentSpecMap = makeSpecMap(specs, "generateAssignment")
  const letCallSpecMap = makeSpecMap(specs, "generateLetCall")
  const typeCallSpecMap = makeSpecMap(specs, "generateTypeCall")
  const typeAssignmentSpecMap = makeSpecMap(specs, "generateTypeAssignment")

  return {
    valueIdentifierGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(valueSpecMap, node)
      if (lookup === null) return
      return fromNode(node, lookup.generateValue(state))
    },
    typeIdentifierGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(typeSpecMap, node)
      if (lookup === null) return
      return fromNode(node, lookup.generateTypeInstance(state))
    },
    // TODO: Remove all these `as any`s
    callGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(callSpecMap, node.func)
      if (lookup === null) return
      return lookup.generateCall(node as any, state, fixture)
    },
    assignmentGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(assignmentSpecMap, node.call.func)
      if (lookup === null) return
      return lookup.generateAssignment(node as any, state, fixture)
    },
    letCallGenerator(node, state, fixture) {
      if (node.call === null) return
      const lookup = tryLookupNamedNode(letCallSpecMap, node.call.func)
      if (lookup === null) return
      return lookup.generateLetCall(node as any, state, fixture)
    },
    typeCallGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(typeCallSpecMap, node.func)
      if (lookup === null) return
      return lookup.generateTypeCall(node as any, state, fixture)
    },
    typeAssignmentGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(typeAssignmentSpecMap, node.call.func)
      if (lookup === null) return
      return lookup.generateTypeAssignment(node as any, state, fixture)
    },
  }
}

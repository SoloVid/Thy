import type {
  Assignment,
  LetCall,
  TypeAssignment,
  TypeCall,
  TypeExpression,
  ValueCall,
  ValueIdentifier,
  ValuePropertyAccess,
} from "tree"
import type { GeneratorState } from "./generator-state"
import type { CodeGeneratorFunc } from "./ts-generator"

export interface SimpleCall extends ValueCall {
  readonly func: ValueIdentifier | ValuePropertyAccess
}

export interface ReallySimpleTypeCall extends TypeCall {
  readonly args: readonly TypeExpression[]
}

export interface GeneratorForGlobalSpec {
  name: string
  /** At the end of the day, anything in Thy should be able to be represented as a value in TypeScript. What is that value? */
  generateValue: (state: GeneratorState) => string
  /** Generate a _**type**_. */
  generateTypeInstance?: (state: GeneratorState) => string
  generateCall?: CodeGeneratorFunc<SimpleCall>
  /**
   * This is basically just a variation on {@link generateCall} that specifically targets type calls.
   *
   * Since the default type-call generator ends up calling the call generator,
   * I'm not sure this is actually useful.
   */
  generateTypeCall?: CodeGeneratorFunc<TypeCall>
  /** Given a really simple type call (like `Union String Number`), generate a _**type**_. */
  generateSimpleTypeCall?: CodeGeneratorFunc<ReallySimpleTypeCall>
  generateAssignment?: CodeGeneratorFunc<Assignment & { call: SimpleCall }>
  generateTypeAssignment?: CodeGeneratorFunc<
    TypeAssignment & { call: SimpleCall | TypeCall }
  >
  generateLetCall?: CodeGeneratorFunc<LetCall & { call: SimpleCall }>
}

export interface GeneratorForGlobalParentSpec {
  name: string
  children: readonly (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[]
}

export function isLeaf(
  spec: GeneratorForGlobalSpec | GeneratorForGlobalParentSpec,
): spec is GeneratorForGlobalSpec {
  return "generateValue" in spec
}

export function isParent(
  spec: GeneratorForGlobalSpec | GeneratorForGlobalParentSpec,
): spec is GeneratorForGlobalParentSpec {
  return "children" in spec
}

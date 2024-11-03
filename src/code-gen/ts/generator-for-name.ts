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
import type { GeneratorState } from "./generator-state"
import type { CodeGeneratorFunc } from "./ts-generator"

export interface SimpleValuePropertyAccess extends ValuePropertyAccess {
  readonly base: ValueIdentifier
}

export interface SimpleCall extends ValueCall {
  readonly func: ValueIdentifier | SimpleValuePropertyAccess
}

export interface SimpleTypeCall extends TypeCall {
  readonly func: TypeIdentifier
}

export interface GeneratorForNameSpec {
  name: string
  /**
   * At the end of the day, anything in Thy should be able to be represented
   * as a value in TypeScript. What is that value?
   *
   * This function should only be specified if the generated thing has
   * a direct equivalent in TypeScript (e.g. `true` and `null`).
   */
  generateValue?: (state: GeneratorState) => string
  /** Generate a _**type**_. */
  generateTypeInstance?: (state: GeneratorState) => string
  generateCall?: CodeGeneratorFunc<SimpleCall>
  /**
   * Generate a type call as *type*.
   */
  generateTypeCall?: CodeGeneratorFunc<SimpleTypeCall>
  generateAssignment?: CodeGeneratorFunc<Assignment & { call: SimpleCall }>
  generateTypeAssignment?: CodeGeneratorFunc<
    TypeAssignment & { call: SimpleCall | SimpleTypeCall }
  >
  generateLetCall?: CodeGeneratorFunc<LetCall & { call: SimpleCall }>
}

export interface GeneratorForNameParentSpec {
  name: string
  children: readonly (GeneratorForNameSpec | GeneratorForNameParentSpec)[]
}

export function isLeaf(
  spec: GeneratorForNameSpec | GeneratorForNameParentSpec,
): spec is GeneratorForNameSpec {
  return !isParent(spec)
}

export function isParent(
  spec: GeneratorForNameSpec | GeneratorForNameParentSpec,
): spec is GeneratorForNameParentSpec {
  return "children" in spec
}

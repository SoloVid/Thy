import type { CompileError } from "../common/compile-error"
import type { Token } from "../tokenizer/token"
import type { TreeNode } from "../tree/tree-node"
import type { GeneratorState } from "./generator-state"
import type { LibraryGeneratorCollection } from "./library-generator"

export interface GeneratorResult {
  readonly output: string
  readonly errors: readonly CompileError[]
}

export type CodeGenerator = (node: TreeNode) => GeneratorResult

export interface CodeGenResult {
  readonly output: GeneratedSnippets
  readonly mightReturn: boolean
}

export interface GeneratorFixture {
  generate: DefiniteCodeGeneratorFuncNoFixture<TreeNode>
  readonly standardLibrary: LibraryGeneratorCollection
}

export type CodeGeneratorFunc<T> = (
  node: T,
  state: GeneratorState,
  fixture: GeneratorFixture,
) => void | GeneratedSnippets
export type DefiniteCodeGeneratorFunc<T> = (
  node: T,
  state: GeneratorState,
  fixture: GeneratorFixture,
) => GeneratedSnippets
export type DefiniteCodeGeneratorFuncNoFixture<T> = (
  node: T,
  state: GeneratorState,
) => GeneratedSnippets
export type IndependentCodeGeneratorFunc = (
  state: GeneratorState,
  fixture: GeneratorFixture,
) => GeneratedSnippets

export type GeneratedSnippets = GeneratedSnippet | DeepArray<GeneratedSnippet>
type DeepArray<T> = (T | DeepArray<T>)[]
// From https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types
// export type ElementType<T> = T extends ReadonlyArray<infer U> ? ElementType<U> : T;

export type GeneratedSnippet =
  | MappedGeneratedSnippet
  | UnmappedGeneratedWhitespace

export interface MappedGeneratedSnippet {
  text: string
  sourceFirstToken: Token
  sourceLastToken?: Token
}

export interface UnmappedGeneratedWhitespace {
  text: string
}

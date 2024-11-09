import type { TreeNode, TypedTreeNode } from "tree"
import type { GeneratedSnippets } from "../generator"
import type { GeneratorState } from "./generator-state"
import type { LibraryGeneratorCollection } from "./library-generator"

export interface GeneratorFixture {
  generate: DefiniteCodeGeneratorFuncNoFixture<TreeNode>
  /** Sometimes we want to generate code for the same node, but as specifically a type. */
  generateAsType: DefiniteCodeGeneratorFuncNoFixture<TypedTreeNode>
  readonly standardLibrary: LibraryGeneratorCollection
}

export type CodeGeneratorFunc<T> = (
  node: T,
  state: GeneratorState,
  fixture: GeneratorFixture,
) => void | GeneratedSnippets
export type CodeGeneratorFuncNoFixture<T> = (
  node: T,
  state: GeneratorState,
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

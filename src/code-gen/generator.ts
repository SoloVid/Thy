import type { CompileError } from "../common/compile-error.ts"
import type { Token } from "../tokenizer/token.ts"
import type { TreeNode } from "../tree/tree-node.ts"

export interface GeneratorResult {
  readonly output: string
  readonly errors: readonly CompileError[]
}

export type CodeGenerator = (node: TreeNode) => GeneratorResult

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

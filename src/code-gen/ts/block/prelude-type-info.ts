import type { GeneratedSnippets } from "../../generator"

export type PreludeTypeInfo = {
  typeParameters: readonly {
    readonly name: string
    readonly inlineSnippet: GeneratedSnippets
  }[]
  typeSnippets: readonly GeneratedSnippets[]
}

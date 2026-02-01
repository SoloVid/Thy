import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import type { TreeNode } from "tree"
import type { GeneratedSnippets } from "../../generator.ts"
import { GeneratorState } from "../generator-state.ts"
import { contextType } from "../generator-context.ts"

export function autoTightS(
  state: GeneratorState,
  looseExpression: string,
): string {
  if (state.context === contextType.looseExpression) {
    return `(${looseExpression})`
  }
  return looseExpression
}
export function autoTight(
  state: GeneratorState,
  looseExpression: (string | GeneratedSnippets)[],
): (string | GeneratedSnippets)[] {
  if (state.context === contextType.looseExpression) {
    return ["(", ...looseExpression, ")"]
  }
  return looseExpression
}

export function autoTightC(
  state: GeneratorState,
  node: TreeNode,
  looseSnippets: GeneratedSnippets,
): GeneratedSnippets {
  if (state.context === contextType.looseExpression) {
    return fromComplicated(node, ["(", looseSnippets, ")"])
  }
  return looseSnippets
}

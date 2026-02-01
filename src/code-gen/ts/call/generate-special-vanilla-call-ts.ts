import type { GeneratorFixture } from "code-gen/ts/ts-generator.ts"
import { fromComplicated } from "code-gen/utils/from-complicated.ts"
import { nodeToString } from "code-gen/utils/to-string.ts"
import type { TreeNode } from "tree"
import { ThyCall } from "tree/call.ts"
import type { GeneratedSnippets } from "../../generator.ts"
import { type GeneratorState } from "../generator-state.ts"
import { generateTypeArgsTs } from "../type/generate-type-args-ts.ts"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets.ts"
import { trace } from "../utils/debug.ts"
import {
  generateCallTsInTypeContext,
  generateValueCallPartsTs,
} from "./generate-call-ts.ts"

export type SpecialVanillaCall = ThyCall

export function tryGenerateSpecialVanillaCallTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): void | GeneratedSnippets {
  if (node.type === "thy-call") {
    return generateSpecialVanillaCallTs(node, state, fixture)
  }
}

export function generateSpecialVanillaCallTs(
  call: ThyCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  trace(`generateSpecialVanillaCallTs() <= ${nodeToString(call)}`)
  // console.log(state)
  if (state.isTypeContext) {
    return generateCallTsInTypeContext(call, state, fixture, "thy")
  }

  const { functionSnippet, typeArgSnippets, argSnippets } =
    generateValueCallPartsTs(call, state, fixture)

  return fromComplicated(call, [
    functionSnippet,
    generateTypeArgsTs(call, typeArgSnippets),
    "(",
    separateSnippetsWithCommas(call, argSnippets),
    ")",
  ])
}

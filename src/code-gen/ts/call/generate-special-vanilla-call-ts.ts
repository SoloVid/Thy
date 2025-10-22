import type { GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { nodeToString } from "code-gen/utils/to-string"
import type { TreeNode } from "tree"
import { ThyCall } from "tree/call"
import type { GeneratedSnippets } from "../../generator"
import { type GeneratorState } from "../generator-state"
import { generateTypeArgsTs } from "../type/generate-type-args-ts"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets"
import { trace } from "../utils/debug"
import {
  generateCallTsInTypeContext,
  generateValueCallPartsTs,
} from "./generate-call-ts"

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

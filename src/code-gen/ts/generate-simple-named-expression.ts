import type { ValuePropertyAccess } from "../../tree"
import type { ValueIdentifier } from "../../tree/term"
import type { GeneratedSnippets, GeneratorFixture } from "../generator"
import type { GeneratorState } from "../generator-state"
import { generatePropertyAccessTs } from "./generate-property-access-ts"
import { generateValueIdentifierTs } from "./term/generate-value-identifier-ts"

export function generateSimpleNamedExpressionTs(
  node: ValueIdentifier | ValuePropertyAccess,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets {
  if (node.type === "value-identifier") {
    return generateValueIdentifierTs(node, state)
  }
  return generatePropertyAccessTs(node, state, fixture)
}

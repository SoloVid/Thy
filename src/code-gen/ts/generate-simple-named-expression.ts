import type { Expression, PropertyAccess } from "../../tree";
import type { Atom } from "../../tree/atom";
import type { GeneratedSnippets, GeneratorFixture } from "../generator";
import type { GeneratorState } from "../generator-state";
import { generateAtomTs } from "./atom/generate-atom-ts";
import { generatePropertyAccessTs } from "./generate-property-access-ts";

export function generateSimpleNamedExpressionTs(node: Atom | PropertyAccess<never>, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    if (node.type === "atom") {
        return generateAtomTs(node, state)
    }
    return generatePropertyAccessTs(node, state, fixture)
}

export function isSimpleNamed(expression: Expression): expression is Atom | PropertyAccess<never> {
    if (expression.type !== "atom" && expression.type !== "property-access") {
        return false
    }
    // TODO: Check property access more thoroughly.
    return true
}

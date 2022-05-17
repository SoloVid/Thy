import type { GeneratorForGlobalSpec } from "../../../generator-for-global";
import type { GeneratorState } from "../../../generator-state";
import { makeIndent } from "../../../indent-string";

type SpecMap = Map<string, GeneratorForGlobalSpec | SpecMap>

export function generateObjectFromHierarchy(hierarchy: SpecMap, state: GeneratorState): string {
    const space = makeIndent(state.indentLevel)
    const childState = state.makeChild({ increaseIndent: true })
    const lines: string[] = []
    for (const [key, value] of hierarchy.entries()) {
        const valueLiteral = value instanceof Map ? generateObjectFromHierarchy(value, childState) : value.generateValue(state)
        lines.push(`${key}: ${valueLiteral}`)
    }
    const linesWithSpace = lines.map(l => `${space}${space}${l}\n`)
    return `{${linesWithSpace}${space}}`
}
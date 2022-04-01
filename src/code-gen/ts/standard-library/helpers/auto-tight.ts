import { GeneratedSnippets } from "../../../generator";
import { contextType, GeneratorState } from "../../../generator-state";

export function autoTightS(state: GeneratorState, looseExpression: string ): string {
    if (state.context === contextType.looseExpression) {
        return `(${looseExpression})`
    }
    return looseExpression
}
export function autoTight(state: GeneratorState, looseExpression: (string | GeneratedSnippets)[]): (string | GeneratedSnippets)[] {
    if (state.context === contextType.looseExpression) {
        return ["(", ...looseExpression, ")"]
    }
    return looseExpression
}
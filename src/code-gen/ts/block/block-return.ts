import type { Block } from "../../../tree/block";

export const returnKeyword = "return"
export const allowReturnKeyword = "let"
export const throwKeyword = "throw"
export const awaitKeyword = "await"

export function mightAffectReturn(block: Block): boolean {
    for (const idea of block.ideas) {
        if (idea.type === "call" && idea.func.type === "atom") {
            // TODO: Maybe account for scopes?
            if ([returnKeyword, allowReturnKeyword, awaitKeyword].includes(idea.func.token.text)) {
                return true
            }
        }
    }
    return false
}

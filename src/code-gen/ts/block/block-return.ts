import { Block } from "../../../tree/block";

export const returnKeyword = "return"
export const allowReturnKeyword = "let"
export const throwKeyword = "throw"
export const awaitKeyword = "await"

export function mightAffectReturn(block: Block): boolean {
    for (const idea of block.ideas) {
        if (idea.type === "call" && idea.func.type === "identifier") {
            // TODO: Maybe account for scopes?
            if ([returnKeyword, allowReturnKeyword, awaitKeyword].includes(idea.func.target.text)) {
                return true
            }
        }
    }
    return false
}

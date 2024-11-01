import type { Block } from "tree"

export function mightAffectReturn(block: Block): boolean {
  for (const idea of block.ideas) {
    if (
      idea.type === "await-call" ||
      idea.type === "return" ||
      idea.type === "let-call"
    ) {
      return true
    }
  }
  return false
}

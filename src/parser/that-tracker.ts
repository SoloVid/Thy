import { tokenError } from "compile-error"
import type { Call, Idea } from "tree"
import type { ParserState } from "./parser-state"
import type { TempThatNode } from "./that"

export function makeThatTracker(addError: ParserState["addError"]) {
  let ideasAvailableForThat: Call[] = []
  let thatTaken = false
  return {
    takeThat: (node: TempThatNode) => {
      thatTaken = true
      const substitution = ideasAvailableForThat.pop()
      if (substitution) {
        return substitution
      }
      addError(
        tokenError(
          node.token,
          `No preceding non-captured call available to substitute for that`,
        ),
      )
      return {
        type: "error-value",
        token: node.token,
      } as const
    },
    shareLatestIdea: (idea: Idea) => {
      if (thatTaken) {
        ideasAvailableForThat = []
      }
      thatTaken = false
      if (
        idea.type === "assignment" ||
        idea.type === "let-call" ||
        idea.type === "return" ||
        idea.type === "type-assignment"
      ) {
        ideasAvailableForThat = []
      } else if (
        idea.type === "await-call" ||
        idea.type === "given-call" ||
        idea.type === "value-call"
      ) {
        ideasAvailableForThat.push(idea)
      }
    },
  }
}

import { tokenError } from "compile-error"
import type { Call, Idea } from "tree"
import type { ParserState } from "./parser-state"
import type { TempThatNode } from "./that"

export function makeThatIdeaTracker(addError: ParserState["addError"]) {
  const ideas: Idea[] = []
  let ideaIndexOffLimits = -1
  let nextThatIdeaIndex = -1
  return {
    ideas: ideas as readonly Idea[],
    takeThat: (node: TempThatNode) => {
      while (nextThatIdeaIndex > ideaIndexOffLimits) {
        const subIdeaIndex = nextThatIdeaIndex
        const substitution = ideas[subIdeaIndex]
        nextThatIdeaIndex--
        if (
          (substitution && substitution.type === "await-call") ||
          substitution.type === "given-call" ||
          substitution.type === "value-call"
        ) {
          // Remove used idea from array.
          ideas.splice(subIdeaIndex, 1)
          return substitution
        }
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
      if (nextThatIdeaIndex < ideas.length - 1) {
        ideaIndexOffLimits = ideas.length - 1
      }
      ideas.push(idea)
      nextThatIdeaIndex = ideas.length - 1
      if (
        idea.type === "assignment" ||
        idea.type === "let-call" ||
        idea.type === "return" ||
        idea.type === "type-assignment"
      ) {
        ideaIndexOffLimits = ideas.length - 1
        // } else if (
        //   idea.type === "await-call" ||
        //   idea.type === "given-call" ||
        //   idea.type === "value-call"
        // ) {
        //   ideasAvailableForThat.push(idea)
      }
    },
  }
}

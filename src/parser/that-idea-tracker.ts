import { tokenError } from "common/compile-error"
import type { Idea } from "tree"
import { isAssignment } from "tree"
import { badParse } from "./error"
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
      return badParse
    },
    shareLatestIdea: (idea: Idea) => {
      if (nextThatIdeaIndex < ideas.length - 1) {
        ideaIndexOffLimits = ideas.length - 1
      }
      // if (idea === badParse) {
      //   return
      // }
      ideas.push(idea)
      nextThatIdeaIndex = ideas.length - 1
      if (
        isAssignment(idea) ||
        idea.type === "let-call" ||
        idea.type === "return" ||
        idea.type === "type-assignment"
      ) {
        ideaIndexOffLimits = ideas.length - 1
      }
    },
  }
}

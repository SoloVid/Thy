import { tokenError } from "common/compile-error"
import type { Idea, ReturnStyle } from "tree"
import { isAssignment, returnStyle } from "tree"
import type { ParserState } from "./parser-state"

export function evaluateReturnStyle(
  state: ParserState,
  existingReturnStyle: ReturnStyle,
  idea: Idea,
): ReturnStyle {
  if (
    idea.type === "return" ||
    idea.type === "type-return" ||
    idea.type === "let-call"
  ) {
    if (existingReturnStyle === returnStyle.explicitExport) {
      if (idea.type === "return" || idea.type === "type-return") {
        state.addError(
          tokenError(
            idea.func.token,
            `Explicit return is incompatible with export-style return`,
          ),
        )
      } else {
        state.addError(
          tokenError(
            idea.letToken,
            `"let" is incompatible with export-style return`,
          ),
        )
      }
    }
    return returnStyle.explicitReturn
  } else if (isAssignment(idea)) {
    if (idea.modifier?.text === "export") {
      if (existingReturnStyle === returnStyle.explicitReturn) {
        state.addError(
          tokenError(
            idea.modifier,
            `"export" is incompatible with explicit return (or "let")`,
          ),
        )
      } else {
        return returnStyle.explicitExport
      }
    }
  }
  return existingReturnStyle
}

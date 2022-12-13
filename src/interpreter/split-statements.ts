import assert from "../utils/assert"
import { extractIndent, getFirstIndent } from "./indentation"
import { splitLineParts } from "./split-line"
import type { Statement } from "./types"

type ReduceState = {
  blockLines: null | readonly string[]
  statements: readonly Statement[]
  multilineCommentTag: string | null
}

export function splitThyStatements(thySourceLines: readonly string[]): readonly Statement[] {
  const ourLevelIndent = getFirstIndent(thySourceLines)

  return thySourceLines.filter(l => l.trim() !== "").reduce((soFar, line) => {
    if (soFar.multilineCommentTag !== null) {
      return {
        ...soFar,
        statements: [...soFar.statements, []],
        multilineCommentTag: line === soFar.multilineCommentTag ? null : soFar.multilineCommentTag,
      }
    }
    const lineLevelIndent = extractIndent(line)
    if (lineLevelIndent.length === ourLevelIndent.length) {
      const multilineCommentTagMatch = /^[A-Z]{3,}$/.exec(line.trimStart())
      if (multilineCommentTagMatch !== null) {
        return {
          ...soFar,
          blockLines: null,
          statements: [...soFar.statements, []],
          multilineCommentTag: multilineCommentTagMatch[0],
        }
      }
      const parts = /^[A-Z]/.test(line.trimStart()) ? [] : splitLineParts(line)
      const [andPart, ...afterAndParts] = parts
      if (andPart === "and") {
        const precedingStatements = [...soFar.statements]
        const lastStatement = precedingStatements.pop() as Statement
        assert(!!lastStatement, "No preceding statement for `and` to match")
        const precedingParts = [...lastStatement]
        precedingParts.pop()
        return {
          ...soFar,
          blockLines: null,
          statements: [...precedingStatements, [...lastStatement, ...afterAndParts]],
        }
      }
      return {
        ...soFar,
        blockLines: null,
        statements: [...soFar.statements, parts],
      }
    }
    if (lineLevelIndent.length > ourLevelIndent.length) {
      const precedingStatements = [...soFar.statements]
      const lastStatement = precedingStatements.pop() as Statement
      assert(!!lastStatement, "No last statement")
      function updateStatement(): readonly [readonly string[], Statement] {
        if (!soFar.blockLines) {
          return [[line], [...lastStatement, [line]]] as const
        }
        const blockLines = [...soFar.blockLines, line]
        const precedingParts = [...lastStatement]
        precedingParts.pop()
        return [blockLines, [...precedingParts, blockLines]] as const
      }
      const [blockLines, updatedStatement] = updateStatement()
      return {
        ...soFar,
        blockLines: blockLines,
        statements: [...precedingStatements, updatedStatement]
      }
    }
    throw new Error(`Bad outdent (indent is not the start of a block and does not match any preceding indentation level)`)
  }, { blockLines: null, statements: [], multilineCommentTag: null } as ReduceState).statements
}

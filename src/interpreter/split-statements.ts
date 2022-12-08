import assert from "node:assert"
import { extractIndent, getFirstIndent } from "./indentation"
import { splitLineParts } from "./split-line"
import type { Statement } from "./types"

export function splitThyStatements(thySourceLines: readonly string[]): readonly Statement[] {
  const ourLevelIndent = getFirstIndent(thySourceLines)

  type ReduceState = {
    blockLines: null | readonly string[]
    statements: readonly Statement[]
  }

  return thySourceLines.reduce((soFar, line) => {
    const lineLevelIndent = extractIndent(line)
    // if (soFar.blockLines !== null) {
    //   assert(lineLevelIndent.length >= ourLevelIndent.length, "Indent should not go further back out than our level")
    //   if ()
    // }
    if (lineLevelIndent.length === ourLevelIndent.length) {
      return {
        ...soFar,
        blockLines: null,
        statements: [...soFar.statements, splitLineParts(line)],
      }
    }
    if (lineLevelIndent.length > ourLevelIndent.length) {
      const precedingStatements = [...soFar.statements]
      const lastStatement = precedingStatements.pop() as Statement
      assert(lastStatement, "No last statement")
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
  }, { blockLines: null, statements: [] } as ReduceState).statements
}

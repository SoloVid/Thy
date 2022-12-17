import assert from "../utils/assert"
import { extractIndent, getFirstIndent } from "./indentation"
import { splitLineParts } from "./split-line"
import { interpretThyMultilineString, RawMultilineStringData } from "./string"
import type { Atom, Statement } from "./types"

type ReduceState = {
  blockLines: null | readonly string[]
  statements: readonly Statement[]
  multilineCommentTag: string | null
  inProgressMultilineString: RawMultilineStringData | null
}

export function splitThyStatements(thySourceLines: readonly string[]): readonly Statement[] {
  const ourLevelIndent = getFirstIndent(thySourceLines)

  function submitMultilineString(soFar: ReduceState): ReduceState {
    if (soFar.inProgressMultilineString === null) {
      return soFar
    }
    const precedingStatements = [...soFar.statements]
    const lastStatement = precedingStatements.pop() as Statement
    assert(!!lastStatement, "No preceding statement for multiline string")
    const combinedString = interpretThyMultilineString(soFar.inProgressMultilineString)
    return {
      ...soFar,
      statements: [...precedingStatements, [...lastStatement, combinedString]],
      inProgressMultilineString: null,
    }
  }

  const finalState = thySourceLines.reduce((soFar0, line) => {
    const lineLevelIndent = extractIndent(line)
    let soFar: ReduceState = soFar0
    if (soFar0.inProgressMultilineString !== null) {
      if (lineLevelIndent.length > ourLevelIndent.length || line.trim() === "") {
        return {
          ...soFar0,
          inProgressMultilineString: {
            ...soFar0.inProgressMultilineString,
            lines: [...soFar0.inProgressMultilineString.lines, line],
          }
        }
      } else {
        soFar = submitMultilineString(soFar0)
      }
    }
    if (line.trim() === "") {
      return soFar
    }
    if (soFar.multilineCommentTag !== null) {
      return {
        ...soFar,
        statements: [...soFar.statements, []],
        multilineCommentTag: line === soFar.multilineCommentTag ? null : soFar.multilineCommentTag,
      }
    }
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
      const parts: Atom[] = /^[A-Z]/.test(line.trimStart()) ? [] : splitLineParts(line)
      const opensMultilineString = parts.length > 0 && parts[parts.length - 1] === `"""`
      if (opensMultilineString) {
        parts.pop()
      }
      const inProgressMultilineString = opensMultilineString ? { indent: lineLevelIndent + "  ", lines: [] } : null
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
          inProgressMultilineString: inProgressMultilineString,
        }
      }
      return {
        ...soFar,
        blockLines: null,
        statements: [...soFar.statements, parts],
        inProgressMultilineString: inProgressMultilineString,
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
  }, {
    blockLines: null,
    statements: [],
    multilineCommentTag: null,
    inProgressMultilineString: null,
  } as ReduceState)
  return submitMultilineString(finalState).statements
}

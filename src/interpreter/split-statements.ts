import assert from "../utils/assert"
import { extractIndent, getFirstIndent } from "./indentation"
import { makeInterpreterError } from "./interpreter-error"
import { splitLineParts } from "./split-line"
import { interpretThyMultilineString, RawMultilineStringData } from "./string"
import { Atom, AtomSingle, isAtomLiterally, Statement, UnparsedBlock } from "./types"

type ReduceState = {
  blockLines: null | UnparsedBlock
  statements: readonly Statement[]
  multilineCommentTag: string | null
  inProgressMultilineString: RawMultilineStringData | null
}

export function splitThyStatements(thySourceLines: readonly string[], startingLineIndex: number): readonly Statement[] {
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
      statements: [...precedingStatements, [...lastStatement, {
        text: combinedString,
        lineIndex: soFar.inProgressMultilineString.lineIndex,
        columnIndex: soFar.inProgressMultilineString.columnIndex,
      }]],
      inProgressMultilineString: null,
    }
  }

  const finalState = thySourceLines.reduce((soFar0, line, lineIndex) => {
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
      if (soFar.blockLines !== null) {
        return addToBlockLines()
      }
      return {
        ...soFar,
        statements: [...soFar.statements, []],
      }
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
      const parts: Atom[] = /^[A-Z]/.test(line.trimStart()) ? [] : splitLineParts(line).map(p => ({
        text: p.text,
        lineIndex: startingLineIndex + lineIndex,
        columnIndex: p.index,
      }))
      const openMultilineStringPart = parts[parts.length - 1]
      const opensMultilineString = parts.length > 0 && isAtomLiterally(openMultilineStringPart, `"""`)
      if (opensMultilineString) {
        parts.pop()
      }
      const inProgressMultilineString = opensMultilineString ? {
        indent: lineLevelIndent + "  ",
        lines: [],
        lineIndex: startingLineIndex + lineIndex,
        columnIndex: (openMultilineStringPart as AtomSingle).columnIndex
      } : null
      const [andPart, ...afterAndParts] = parts
      if (isAtomLiterally(andPart, "and")) {
        const precedingStatements = [...soFar.statements]
        const lastStatement = precedingStatements.pop() as Statement
        if (!lastStatement) {
          throw makeInterpreterError(andPart, "No preceding statement for `and` to match")
        }
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
      return addToBlockLines()
    }

    function addToBlockLines() {
      const precedingStatements = [...soFar.statements]
      const lastStatement = precedingStatements.pop() as Statement
      assert(!!lastStatement, "No last statement")
      function updateStatement(): readonly [UnparsedBlock, Statement] {
        if (!soFar.blockLines) {
          const unparsedBlock = {
            lines: [line],
            lineIndex: startingLineIndex + lineIndex,
          }
          return [unparsedBlock, [...lastStatement, unparsedBlock]] as const
        }
        const blockLines = [...soFar.blockLines.lines, line]
        const precedingParts = [...lastStatement]
        precedingParts.pop()
        const unparsedBlock = {
          lines: blockLines,
          lineIndex: soFar.blockLines.lineIndex,
        }
        return [unparsedBlock, [...precedingParts, unparsedBlock]] as const
      }
      const [blockLines, updatedStatement] = updateStatement()
      return {
        ...soFar,
        blockLines: blockLines,
        statements: [...precedingStatements, updatedStatement]
      }
    }

    throw makeInterpreterError(
      { text: ourLevelIndent, lineIndex: startingLineIndex + lineIndex, columnIndex: 0 },
      `Bad outdent (indent is not the start of a block and does not match any preceding indentation level)`
    )
  }, {
    blockLines: null,
    statements: [],
    multilineCommentTag: null,
    inProgressMultilineString: null,
  } as ReduceState)
  return submitMultilineString(finalState).statements
}

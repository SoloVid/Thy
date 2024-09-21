import type { TokenType } from "./token-type"

export type TokenizerState = {
  readonly text: string
  readonly advance: (
    lastTokenType: TokenType | null,
    characters: number,
  ) => void
  readonly offset: number
  readonly line: number
  readonly column: number
  readonly lastTokenType: TokenType | null
  readonly lastTokenSkipped: boolean
  readonly hasMoreText: () => boolean
  readonly currentIndentWidth: number
}

export function makeTokenizerState(source: string): TokenizerState {
  const statefulIndentRegex = new RegExp(/^ */, "my")
  /**
   * For line (0-based index i), what is the absolute offset in the file?
   *
   * Line 0 always has offset 0.
   * Line 1 would have offset 10 if line 0 had 10 characters.
   * Line 2 would have offset 15 if line 1 had 5 characters.
   */
  const lineOffsets = source.split("\n").reduce(
    (soFar, line) => {
      return {
        nextOffset: soFar.nextOffset + line.length + 1, // +1 for newline
        offsets: [...soFar.offsets, soFar.nextOffset],
      }
    },
    {
      nextOffset: 0,
      offsets: [] as number[],
    },
  ).offsets

  function calculateIndentWidth(line: number) {
    statefulIndentRegex.lastIndex = lineOffsets[line]
    return (statefulIndentRegex.exec(source)?.[0] ?? "").length
  }

  const me = {
    text: source,
    advance: (lastTokenType: TokenType | null, characters: number) => {
      if (lastTokenType !== null) {
        me.lastTokenType = lastTokenType
        me.lastTokenSkipped = false
      } else {
        me.lastTokenSkipped = true
      }
      me.offset += characters
      while (
        me.line + 1 < lineOffsets.length &&
        lineOffsets[me.line + 1] < me.offset
      ) {
        me.line++
      }
      me.column = me.offset - lineOffsets[me.line]
      me.currentIndentWidth = calculateIndentWidth(me.line)
    },
    offset: 0,
    line: 0,
    column: 0,
    lastTokenType: null as TokenType | null,
    lastTokenSkipped: false,
    hasMoreText: () => me.offset < source.length,
    currentIndentWidth: calculateIndentWidth(0),
    lineOffsets: lineOffsets,
  }
  return me
}

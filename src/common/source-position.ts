export interface SourcePosition {
  /** 0-based index of character relative to start of file. */
  readonly offset: number
  /** 0-based index of line in source. */
  readonly line: number
  /** 0-based index of column in source. */
  readonly column: number
}

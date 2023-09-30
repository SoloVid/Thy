
export type AtomSingle = {
  text: string
  lineIndex: number
  columnIndex: number
}
export type Atom = AtomSingle | UnparsedBlock
export type Statement = readonly Atom[]

export type UnparsedBlock = {
  lines: readonly string[]
  lineIndex: number
}

export type ThyBlockContext = {
  readonly argsToUse: unknown[]
  givenUsed: boolean
  readonly implicitArguments: Readonly<Record<string, unknown>>
  implicitArgumentFirstUsed: null | string
  readonly closure: Record<string, unknown>
  readonly closureVariableIsImmutable: Readonly<Record<string, boolean>>
  readonly variablesInBlock: Record<string, unknown>
  readonly variableIsImmutable: Record<string, boolean>
  readonly bareVariables: string[]
  readonly exportedVariables: string[]
  /** `undefined` is special and indicates that no `that` value is available. */
  thatValue: unknown
  /** `undefined` is special and indicates that no `beforeThat` value is available. */
  beforeThatValue: unknown
  errorTraceInfo: null | {
    errorCloseToCall: Error
    failingLocation: { lineIndex: number, columnIndex: number }
  }
  sourceFile: string
}

export function isAtomLiterally(atom: Atom | undefined, text: string) {
  if (!atom || !("text" in atom)) {
    return false
  }
  return atom.text === text
}

export function isSimpleAtom(atom: Atom | undefined): atom is AtomSingle {
  return !!atom && "text" in atom
}

export type Atom = string | Block | MultilineString
export type Statement = readonly Atom[]

export type Block = readonly string[]
export type MultilineString = { type: "multiline-string", indent: string, lines: readonly string[] }

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
}

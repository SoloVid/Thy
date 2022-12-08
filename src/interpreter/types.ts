export type Atom = string | (readonly string[])
export type Statement = readonly Atom[]

export type ThyBlockContext = {
  readonly argsToUse: unknown[]
  givenUsed: boolean
  readonly implicitArguments: null | Readonly<Record<string, unknown>>
  implicitArgumentFirstUsed: null | string
  readonly closure: Readonly<Record<string, unknown>>
  readonly variablesInBlock: Record<string, unknown>
  readonly variableIsImmutable: Record<string, boolean>
}

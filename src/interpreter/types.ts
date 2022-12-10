export type Atom = string | (readonly string[])
export type Statement = readonly Atom[]

export type ThyBlockContext = {
  readonly argsToUse: unknown[]
  givenUsed: boolean
  readonly implicitArguments: Readonly<Record<string, unknown>>
  implicitArgumentFirstUsed: null | string
  readonly closure: Record<string, unknown>
  readonly closureVariableIsImmutable: Readonly<Record<string, boolean>>
  readonly variablesInBlock: Record<string, unknown>
  readonly variableIsImmutable: Record<string, boolean>
}

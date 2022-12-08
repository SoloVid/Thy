export type Atom = string | (readonly string[])
export type Statement = readonly Atom[]

export type ThyBlockContext = {
  argsToUse: unknown[]
  implicitArguments: null | Record<string, unknown>
  variablesInBlock: Record<string, unknown>
}

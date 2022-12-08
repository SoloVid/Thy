import type { ThyBlockContext } from "./types";

export const makeSimpleContext = (o: Partial<ThyBlockContext> = {}): ThyBlockContext => ({
  argsToUse: [],
  givenUsed: false,
  implicitArguments: null,
  implicitArgumentFirstUsed: null,
  variablesInBlock: {},
  variableIsImmutable: {},
  closure: {},
  ...o,
})

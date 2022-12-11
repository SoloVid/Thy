import type { ThyBlockContext } from "./types";

export const makeSimpleContext = (o: Partial<ThyBlockContext> = {}): ThyBlockContext => ({
  argsToUse: [],
  givenUsed: false,
  implicitArguments: {},
  implicitArgumentFirstUsed: null,
  variablesInBlock: {},
  variableIsImmutable: {},
  closure: {},
  closureVariableIsImmutable: {},
  thatValue: undefined,
  beforeThatValue: undefined,
  ...o,
})

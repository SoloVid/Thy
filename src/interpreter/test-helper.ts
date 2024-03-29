import type { ThyBlockContext } from "./types";

export const makeSimpleContext = (o: Partial<ThyBlockContext> = {}): ThyBlockContext => ({
  argsToUse: [],
  givenUsed: false,
  implicitArguments: {},
  implicitArgumentFirstUsed: null,
  variablesInBlock: {},
  variableIsImmutable: {},
  bareVariables: [],
  exportedVariables: [],
  closure: {},
  closureVariableIsImmutable: {},
  thatValue: undefined,
  beforeThatValue: undefined,
  sourceFile: "<test thy source>",
  ...o,
})

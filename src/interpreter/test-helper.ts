import type { ThyBlockContext } from "./types";

export const makeSimpleContext = (o: Partial<ThyBlockContext> = {}): ThyBlockContext => ({
  argsToUse: [],
  implicitArguments: null,
  variablesInBlock: {},
  variableIsImmutable: {},
  ...o,
})

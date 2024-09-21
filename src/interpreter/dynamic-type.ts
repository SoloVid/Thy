const runtimeValueType = Symbol("it's a runtime value (basically unknown)")
/** This type is intended to help me not accidentally stumble over `unknown`. */
export type RuntimeValue = {
  _$YOUSHOULDNTBETYPINGTHIS$_: typeof runtimeValueType
}

export function yesThisValueIsForRuntime(value: unknown): RuntimeValue {
  return value as unknown as RuntimeValue
}

export type RuntimeObject = Record<string, RuntimeValue>

export function yesIThinkThisIsRuntimeObject(
  value: RuntimeValue,
): Record<string, RuntimeValue> {
  return value as unknown as RuntimeObject
}

export type RuntimeFunction = (...args: readonly RuntimeValue[]) => RuntimeValue
export type RuntimeFunctionAsync = (
  ...args: readonly RuntimeValue[]
) => PromiseLike<RuntimeValue>

export function yesIThinkThisIsRuntimeFunction(
  value: RuntimeValue,
): RuntimeFunction {
  return value as unknown as RuntimeFunction
}

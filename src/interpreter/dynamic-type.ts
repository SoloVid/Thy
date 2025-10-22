const runtimeValueType = Symbol("it's a runtime value (basically unknown)")
/** This type is intended to help me not accidentally stumble over `unknown`. */
export type RuntimeValue = {
  _$YOUSHOULDNTBETYPINGTHIS$_: typeof runtimeValueType
}
const runtimeVoidType = Symbol("it's a runtime value (basically unknown)")
export type RuntimeVoid = {
  _$YOUSHOULDNTBETYPINGTHIS$_: typeof runtimeVoidType
}
export const runtimeVoid = undefined as unknown as RuntimeVoid
export type RuntimeReturn = RuntimeValue | RuntimeVoid
export function isVoid(value: RuntimeReturn): value is RuntimeVoid {
  return value === runtimeVoid
}
export function assertNotVoid(
  value: RuntimeReturn,
): asserts value is RuntimeValue {
  if (isVoid(value)) {
    throw new Error("Unexpected void (undefined) value")
  }
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

export type RuntimeFunction = (
  ...args: readonly RuntimeValue[]
) => RuntimeReturn
export type RuntimeFunctionAsync = (
  ...args: readonly RuntimeValue[]
) => PromiseLike<RuntimeReturn>

export function yesIThinkThisIsRuntimeFunction(
  value: RuntimeValue,
): RuntimeFunction {
  return value as unknown as RuntimeFunction
}
export function forgetThisRuntimeFunctionIsAsync(
  value: RuntimeFunctionAsync,
): RuntimeFunction {
  return value as unknown as RuntimeFunction
}

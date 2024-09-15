export const booleanFunc = (p: boolean) => {}
export const numberFunc = (p: number) => {}
export const stringFunc = (p: string) => {}
export const unknownFunc = (p: unknown) => {}
export const voidFunc = (p: undefined) => {}

export const BasicUnion = undefined as unknown as string | number
export const UnionWithValue = undefined as unknown as string | typeof unknownFunc
function _NonTrivialUnion_WrappedValue() {
  return <_A, _B>(_a: _A, _b: _B) => undefined as unknown as _A | _B
}
type _NonTrivialUnion_RestParams =
  ReturnType<typeof _NonTrivialUnion_WrappedValue> extends (
    _1: unknown,
    _2: unknown,
    ...rest: infer U
  ) => unknown
    ? U
    : []
function _NonTrivialUnion_Call() {
  return _NonTrivialUnion_WrappedValue()(
    undefined as unknown as string,
    () => {
      return "himom" as const
    },
    ...([] as unknown[] as _NonTrivialUnion_RestParams),
  )
}
export const NonTrivialUnion = undefined as unknown as ReturnType<
  typeof _NonTrivialUnion_Call
>

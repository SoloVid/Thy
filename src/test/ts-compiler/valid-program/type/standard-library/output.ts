const booleanFunc = (p: boolean) => {
}
const numberFunc = (p: number) => {
}
const stringFunc = (p: string) => {
}
const unknownFunc = (p: unknown) => {
}
const voidFunc = (p: undefined) => {
}

const BasicUnion = undefined as unknown as string | number
const UnionWithValue = undefined as unknown as string | typeof unknownFunc
function _NonTrivialUnion_WrappedValue() { return <_A, _B>(_a: _A, _b: _B) => (undefined as unknown as _A | _B) }
type _NonTrivialUnion_RestParams = (ReturnType<typeof _NonTrivialUnion_WrappedValue>) extends (_1: unknown, _2: unknown, ...rest: infer U) => unknown ? U : []
function _NonTrivialUnion_Call() { return _NonTrivialUnion_WrappedValue()(undefined as unknown as string, () => {
  return "himom" as const
}, ...([] as unknown[] as _NonTrivialUnion_RestParams)) }
const NonTrivialUnion = undefined as unknown as ReturnType<typeof _NonTrivialUnion_Call>

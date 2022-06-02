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

type BasicUnion = string | number


function _BasicUnion_WrappedValue() { return <_A, _B>(_a: _A, _b: _B) => (undefined as unknown as _A | _B) }
type _BasicUnion_RestParams = (ReturnType<typeof _BasicUnion_WrappedValue>) extends (_1: unknown, _2: unknown, ...rest: infer U) => unknown ? U : []
function _BasicUnion_Call() { return _BasicUnion_WrappedValue()(undefined as unknown as string, undefined as unknown as number, ...([] as unknown[] as _BasicUnion_RestParams)) }
const BasicUnion = undefined as unknown as ReturnType<typeof _BasicUnion_Call>
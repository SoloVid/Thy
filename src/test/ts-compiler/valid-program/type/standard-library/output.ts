export function initThy(_global: unknown) {
  const booleanFunc = (_p: boolean) => {
    const p = _p
  }
  const numberFunc = (_p: number) => {
    const p = _p
  }
  const stringFunc = (_p: string) => {
    const p = _p
  }
  const unknownFunc = (_p: unknown) => {
    const p = _p
  }
  const voidFunc = (_p: undefined) => {
    const p = _p
  }

  const BasicIntersection = undefined as unknown as (string & number)
  const BasicUnion = undefined as unknown as (string | number)
  const UnionWithValue = undefined as unknown as (string | typeof unknownFunc)
  function _1_WrappedType() { return () => {
    return "himom" as const
  } }
  const NonTrivialUnion = undefined as unknown as (string | ReturnType<typeof _1_WrappedType>)
}

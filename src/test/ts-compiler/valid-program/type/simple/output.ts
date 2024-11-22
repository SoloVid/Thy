export function initThy(_global: unknown) {
  const himom = () => {
    return "himom" as const
  }

  function _A_WrappedValue() { return himom }
  type _A_RestParams = ReturnType<typeof _A_WrappedValue> extends (...rest: infer U) => unknown ? U : []
  function _A_WrappedType() { return _A_WrappedValue()(...([] as unknown[] as _A_RestParams)) }
  const A = undefined as unknown as ReturnType<typeof _A_WrappedType>

  const funcWithTypes = <_T extends typeof A = typeof A>(_p: typeof A): typeof A => {
    void "type return erased"
    const T = undefined as unknown as _T
    const p = _p
    return p
  }
}

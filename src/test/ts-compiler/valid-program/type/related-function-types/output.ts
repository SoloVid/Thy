export function initThy(_global: {}) {
  const RelatedTypesType = undefined as unknown as "himom"

  class _U_TypePackage<_T extends typeof RelatedTypesType = typeof RelatedTypesType> { f() {
    const T = undefined as unknown as _T
    const U0 = undefined as unknown as typeof T | number
    return U0
  } }
  class _1_TypePackage<_T extends typeof RelatedTypesType = typeof RelatedTypesType, _U extends ReturnType<_U_TypePackage<_T>["f"]> = ReturnType<_U_TypePackage<_T>["f"]>> { f() {
    const T = undefined as unknown as _T
    const U0 = undefined as unknown as typeof T | number
    const U = undefined as unknown as _U
    return U
  } }
  class _p_TypePackage<_T extends typeof RelatedTypesType = typeof RelatedTypesType, _U extends ReturnType<_U_TypePackage<_T>["f"]> = ReturnType<_U_TypePackage<_T>["f"]>> { f() {
    const T = undefined as unknown as _T
    const U0 = undefined as unknown as typeof T | number
    const U = undefined as unknown as _U
    void "type return erased"
    return U
  } }
  const funcWithRelatedTypes = <_T extends typeof RelatedTypesType = typeof RelatedTypesType, _U extends ReturnType<_U_TypePackage<_T>["f"]> = ReturnType<_U_TypePackage<_T>["f"]>>(_p: ReturnType<_p_TypePackage<_T, _U>["f"]>): ReturnType<_1_TypePackage<_T, _U>["f"]> => {
    const T = undefined as unknown as _T
    const U0 = undefined as unknown as typeof T | number
    const U = undefined as unknown as _U
    void "type return erased"
    const p = _p
    return p
  }

  return {
    RelatedTypesType,
    funcWithRelatedTypes,
  }
}

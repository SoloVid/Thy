const RelatedTypesType = undefined as unknown as "himom"

class _T_TypePackage { f() {
  return undefined as unknown as typeof RelatedTypesType
} }
class _U_TypePackage<_T_Param extends ReturnType<_T_TypePackage["f"]>> { f() {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  return undefined as unknown as typeof U0
} }
class _1_TypePackage<_T_Param extends ReturnType<_T_TypePackage["f"]>, _U_Param extends ReturnType<_U_TypePackage<_T_Param>["f"]>> { f() {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  const U = undefined as unknown as _U_Param
  return undefined as unknown as typeof U
} }
class _p_TypePackage<_T_Param extends ReturnType<_T_TypePackage["f"]>, _U_Param extends ReturnType<_U_TypePackage<_T_Param>["f"]>> { f() {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  const U = undefined as unknown as _U_Param
  return undefined as unknown as typeof U
} }
const funcWithRelatedTypes = <_T_Param extends ReturnType<_T_TypePackage["f"]>, _U_Param extends ReturnType<_U_TypePackage<_T_Param>["f"]>>(p: ReturnType<_p_TypePackage<_T_Param, _U_Param>["f"]>): ReturnType<_1_TypePackage<_T_Param, _U_Param>["f"]> => {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  const U = undefined as unknown as _U_Param
  return p
}

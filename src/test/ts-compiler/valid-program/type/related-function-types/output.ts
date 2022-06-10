// TODO: The def simple type call generator isn't working as desired..
const A2 = "himom"

// TODO: None of these classes are getting generated at present.
class _18 { f() {
  return undefined as unknown as typeof A
} }
class _19<_T_Param extends ReturnType<_18['f']>> { f() {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  return undefined as unknown as typeof U0
} }
class _20<_T_Param extends ReturnType<_18['f']>, _U_Param extends ReturnType<_19<_T_Param>['f']>> { f() {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  const U = undefined as unknown as _U_Param
  return undefined as unknown as typeof U
} }
class _21<_T_Param extends ReturnType<_18['f']>, _U_Param extends ReturnType<_19<_T_Param>['f']>> { f() {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  const U = undefined as unknown as _U_Param
  return undefined as unknown as typeof U
} }
const funcWithRelatedTypes = <_T_Param extends ReturnType<_18['f']>, _U_Param extends ReturnType<_19<_T_Param>['f']>>(p: ReturnType<_21<_T_Param, _U_Param>['f']>): ReturnType<_20<_T_Param, _U_Param>['f']> => {
  const T = undefined as unknown as _T_Param
  const U0 = undefined as unknown as typeof T | number
  const U = undefined as unknown as _U_Param
  return p
}

// Just want to find this output

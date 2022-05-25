const himom = () => {
  return "himom" as const
}

function _A_WrappedValue() { return himom }
type _A_RestParams = (ReturnType<typeof _A_WrappedValue>) extends (...rest: infer U) => unknown ? U : []
function _A_Call() { return _A_WrappedValue()(...([] as unknown[] as _A_RestParams)) }
const A = undefined as unknown as ReturnType<typeof _A_Call>

const funcWithTypes = <_T_Param extends typeof A>(p: typeof A): typeof A => {
  const T = undefined as unknown as _T_Param
  return p
}

// Just want to find this output

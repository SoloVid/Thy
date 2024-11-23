export function initThy(_global: {}) {
  console.log(((1 + 1) / (1 * 1)) === 1)

  const makeFunctionFunction = (_a: number) => {
    const a = _a
    return (_b: number) => {
      const b = _b
      return (_c: number) => {
        const c = _c
        return (a < b) && (b < c)
      }
    }
  }

  // Calling that: const result = makeFunctionFunction(1)(2)(3)
  const result = makeFunctionFunction(1 as const)(2 as const)(3 as const)

  return {
    makeFunctionFunction,
    result,
  }
}

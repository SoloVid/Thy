console.log(((1 + 1) / (1 * 1)) === 1)

export const makeFunctionFunction = (a: number) => {
  return (b: number) => {
    return (c: number) => {
      return (a < b) && (b < c)
    }
  }
}

// Calling that: const result = makeFunctionFunction(1)(2)(3)
export const result = makeFunctionFunction(1 as const)(2 as const)(3 as const)

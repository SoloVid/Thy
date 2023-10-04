export const addBuiltin = (_a: number, _b: number) => _a + _b
export const subtractBuiltin = (_a: number, _b: number) => _a - _b
export const multiplyBuiltin = (_a: number, _b: number) => _a * _b
export const divideBuiltin = (_a: number, _b: number) => _a / _b
export const modBuiltin = (_a: number, _b: number) => _a % _b
export const sqrtBuiltin = (_a: number) => Math.sqrt(_a)

export const math = {
  "add": addBuiltin,
  "subtract": subtractBuiltin,
  "multiply": multiplyBuiltin,
  "divide": divideBuiltin,
  "mod": modBuiltin,
  "sqrt": sqrtBuiltin,
}

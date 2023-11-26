export const addBuiltin = (_a: number, _b: number) => _a + _b
export const subtractBuiltin = (_a: number, _b: number) => _a - _b
export const multiplyBuiltin = (_a: number, _b: number) => _a * _b
export const divideBuiltin = (_a: number, _b: number) => _a / _b
export const modBuiltin = (_a: number, _b: number) => _a % _b
export const powBuiltin = (_base: number, _exponent: number) => Math.pow(_base, _exponent)
export const rootBuiltin = (_x: number, _n: number = 2) => Math.pow(_x, 1 / _n)

export const math = {
  "add": addBuiltin,
  "subtract": subtractBuiltin,
  "multiply": multiplyBuiltin,
  "divide": divideBuiltin,
  "mod": modBuiltin,
  "pow": powBuiltin,
  "root": rootBuiltin,
}


export const allBuiltin = (_a: boolean, _b?: boolean, _c?: boolean, _d?: boolean) =>
  (_a) && (_b ?? true) && (_c ?? true) && (_d ?? true)
export const someBuiltin = (_a: boolean, _b?: boolean, _c?: boolean, _d?: boolean) =>
  (_a) || (_b ?? false) || (_c ?? false) || (_d ?? false)

export const ascBuiltin = (_a: number, _b: number = _a + 1, _c: number = _b + 1, _d: number = _c + 1) =>
  _a < _b && _b < _c && _c < _d
export const descBuiltin = (_a: number, _b: number = _a - 1, _c: number = _b - 1, _d: number = _c - 1) =>
  _a > _b && _b > _c && _c > _d
export const equalBuiltin = (_a: unknown, _b: unknown = _a, _c: unknown = _b, _d: unknown = _c) =>
  _a === _b && _b === _c && _c === _d

export const notBuiltin = (_a: boolean) => !_a

export const check = {
  "all": allBuiltin,
  "some": someBuiltin,
  "asc": ascBuiltin,
  "desc": descBuiltin,
  "equal": equalBuiltin,
  "not": notBuiltin,
}

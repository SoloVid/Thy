export const allBuiltin = (a: boolean, b?: boolean, c?: boolean, d?: boolean) =>
  a && (b ?? true) && (c ?? true) && (d ?? true)
export const someBuiltin = (
  a: boolean,
  b?: boolean,
  c?: boolean,
  d?: boolean,
) => a || (b ?? false) || (c ?? false) || (d ?? false)

export const ascBuiltin = (
  a: number,
  b: number = a + 1,
  c: number = b + 1,
  d: number = c + 1,
) => a < b && b < c && c < d
export const descBuiltin = (
  a: number,
  b: number = a - 1,
  c: number = b - 1,
  d: number = c - 1,
) => a > b && b > c && c > d
export const equalBuiltin = (
  a: unknown,
  b: unknown = a,
  c: unknown = b,
  d: unknown = c,
) => a === b && b === c && c === d

export const notBuiltin = (a: boolean) => !a

export const check = {
  all: allBuiltin,
  some: someBuiltin,
  asc: ascBuiltin,
  desc: descBuiltin,
  equal: equalBuiltin,
  not: notBuiltin,
}

export const unionBuiltin = <A, B, C = never, D = never>() =>
  undefined as unknown as A | B | C | D

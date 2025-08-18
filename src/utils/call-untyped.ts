export const callUntyped = <T, U>(input: T, f: (input: T) => U) => {
  return f(input)
}

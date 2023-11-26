export const regexBuiltin = (pattern: string | RegExp, flags?: string) => {
  return new RegExp(pattern, flags)
}

export const jsonEncodeBuiltin = (thing: unknown) => {
  return JSON.stringify(thing, null, 2)
}

export const jsonDecodeBuiltin = (json: string) => {
  return JSON.parse(json) as unknown
}

export const json = {
  encode: jsonEncodeBuiltin,
  decode: jsonDecodeBuiltin,
}

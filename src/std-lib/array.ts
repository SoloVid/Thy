type InitArgs<T> = {
  a: (e: T) => void
  push: (e: T) => void
}

export const mutableArrayBuiltin = <_T>(init: (args: InitArgs<_T>) => void) => {
  const arr: _T[] = []
  init({
    a: (e) => arr.push(e),
    push: (e) => arr.push(e),
  })
  return arr
}

export const arrayBuiltin = <_T>(init: (args: InitArgs<_T>) => void): readonly _T[] => mutableArrayBuiltin(init)

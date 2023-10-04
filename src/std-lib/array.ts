import assert from "../utils/assert"

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

export const getBuiltin = <_T>(_array: _T[], _index: number) => {
  assert(_index >= 0, "Array index cannot be negative")
  assert(_index < _array.length, `Array index cannot exceed length of array (${_array.length})`)
  return _array[_index]
}

export const setBuiltin = <_T>(_array: _T[], _index: number, _value: _T) => {
  assert(_index >= 0, "Array index cannot be negative")
  assert(_index < _array.length, `Array index cannot exceed length of array (${_array.length})`)
  _array[_index] = _value
}

import assert from "../utils/assert"

export type ArrayInitFunction<T> = (args: ArrayInitArgs<T>) => void

export type ArrayInitArgs<T> = {
  /** Add element to the array. */
  a: (e: T) => void
  /** Add element to the array. */
  push: (e: T) => void
}

/**
 * Create a mutable [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
 * 
 * @example
 * Create an array `myArr` with three elements: `1`, `2`, and `3`.
 * ```thy
 * myArr is array
 *   push 1
 *   push 2
 *   push 3
 * ```
 * 
 * @param init to initialize the array with data
 * @returns mutable [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
 */
export const mutableArrayBuiltin = <_T>(init?: ArrayInitFunction<_T>) => {
  const arr: _T[] = []
  if (init) {
    init({
      a: (e) => arr.push(e),
      push: (e) => arr.push(e),
    })
  }
  return arr
}

/**
 * Create an immutable [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
 * 
 * @example
 * Create an array `myArr` with three elements: `1`, `2`, and `3`.
 * ```thy
 * myArr is array
 *   push 1
 *   push 2
 *   push 3
 * ```
 * 
 * @param init to initialize the array with data
 * @returns immutable [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
 */
export const arrayBuiltin = <_T>(init?: ArrayInitFunction<_T>): readonly _T[] => mutableArrayBuiltin(init)

/**
 * Get an array element.
 * 
 * @remarks
 * JavaScript's bracket syntax is unavailable in Thy,
 * so this function provides the accessor capability of the bracket syntax.
 * 
 * @example
 * Get the 3rd element of the array `myArr`.
 * ```thy
 * thirdElement is get myArr 2
 * ```
 * JavaScript equivalent would be this:
 * ```js
 * const thirdElement = myArr[2]
 * ```
 * 
 * @param _array 
 * @param _index 
 * @returns 
 */
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

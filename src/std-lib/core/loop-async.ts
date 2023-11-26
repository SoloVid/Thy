type MaybePromiseLike<T> = T | PromiseLike<T>

export const loopAsyncForeverBuiltin = async <_T>(loopCallback: () => MaybePromiseLike<_T | undefined>): Promise<_T | undefined> => {
  while (true) {
    const result = await loopCallback()
    if (result !== undefined) {
      return result
    }
  }
}

export const loopAsyncTimesBuiltin = async <_T>(count: number, loopCallback: (index: number) => MaybePromiseLike<_T | undefined>): Promise<_T | undefined> => {
  for (let i = 0; i < count; i++) {
    const result = await loopCallback(i)
    if (result !== undefined) {
      return result
    }
  }
}

export const loopAsyncElementsBuiltin = async <_T, _Element>(collection: readonly _Element[], loopCallback: (element: _Element, index: number) => MaybePromiseLike<_T | undefined>): Promise<_T | undefined> => {
  let i = 0
  for (const element of collection) {
    const result = await loopCallback(element, i)
    if (result !== undefined) {
      return result
    }
    i++
  }
}

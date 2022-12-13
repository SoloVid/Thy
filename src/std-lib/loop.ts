export const loopForeverBuiltin = <_T>(loopCallback: () => _T | undefined) => {
  while (true) {
    const result = loopCallback()
    if (result !== undefined) {
      return result
    }
  }
}

export const loopTimesBuiltin = <_T>(count: number, loopCallback: (index: number) => _T | undefined) => {
  for (let i = 0; i < count; i++) {
    const result = loopCallback(i)
    if (result !== undefined) {
      return result
    }
  }
}

export const loopElementsBuiltin = <_T, _Element>(collection: readonly _Element[], loopCallback: (element: _Element, index: number) => _T | undefined) => {
  let i = 0
  for (const element of collection) {
    const result = loopCallback(element, i)
    if (result !== undefined) {
      return result
    }
    i++
  }
}

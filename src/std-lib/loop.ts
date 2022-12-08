export const loopBuiltin = <_T>(loopCallback: () => _T | undefined) => {
  while (true) {
    const result = loopCallback()
    if (result !== undefined) {
      return result
    }
  }
}

import { catchBuiltin, finallyBuiltin } from "./globals"

export const throwBuiltin = (_message: string) => {
  throw new Error(_message)
}

export const tryBuiltin = <_T>(
  tryBlock: () => _T,
  catchOrFinally: typeof catchBuiltin | typeof finallyBuiltin,
  secondBlock: (e: unknown) => _T | undefined
) => {
  try {
    return tryBlock()
  } catch (e: unknown) {
    if (catchOrFinally === catchBuiltin) {
      const catchResult = secondBlock(e)
      if (catchResult !== undefined) {
        return catchResult
      }
      throw e
    }
  } finally {
    if (catchOrFinally === finallyBuiltin) {
      const finallyResult = secondBlock(null)
      if (finallyResult !== undefined) {
        return finallyResult
      }
    }
  }
  throw new Error(`try fell through unexpectedly; sentinel ${catchOrFinally}`)
}

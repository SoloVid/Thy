import type { elseBuiltin } from "./globals"

export const ifBuiltin = <_T>(condition: boolean, trueCallback: () => _T, elseLiteral?: typeof elseBuiltin, falseCallback?: () => _T) => {
  if (condition) {
    return trueCallback()
  } else if (falseCallback) {
    return falseCallback()
  }
}
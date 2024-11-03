import type { elseBuiltin } from "./globals"

export const ifBuiltin = <T>(
  condition: boolean,
  trueCallback: () => T,
  elseLiteral?: typeof elseBuiltin,
  falseCallback?: () => T,
) => {
  if (condition) {
    return trueCallback()
  } else if (falseCallback) {
    return falseCallback()
  }
}

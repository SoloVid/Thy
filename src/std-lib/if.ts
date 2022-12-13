export const ifBuiltin = <_T>(condition: boolean, trueCallback: () => _T, elseLiteral?: "else", falseCallback?: () => _T) => {
  if (condition) {
    return trueCallback()
  } else if (falseCallback) {
    return falseCallback()
  }
}
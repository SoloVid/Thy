export function profileSection<T>(label: string, fn: () => T): T {
  const start = process.hrtime.bigint()
  function printDuration() {
    const end = process.hrtime.bigint()
    console.log(`${label}: ${(Number(end - start) / 1_000_000).toFixed(2)} ms`)
  }
  try {
    const result = fn()
    if (result instanceof Promise) {
      result.finally(() => {
        printDuration()
      })
    } else {
      printDuration()
    }
    return result
  } catch (e) {
    printDuration()
    throw e
  }
}

export const debugOn = false

export function debug(...args: readonly unknown[]) {
  if (debugOn) {
    console.log(...args)
  }
}

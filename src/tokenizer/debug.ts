const debugOn = false

export function debug(getArgs: () => readonly unknown[]) {
  if (debugOn) {
    console.log(...getArgs())
  }
}

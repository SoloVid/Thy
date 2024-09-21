export type MayWait<T> = YesWait<T> | NotWait<T>
export type YesWait<T> = {
  readonly wait: true
  readonly promise: PromiseLike<T>
}
export type NotWait<T> = {
  readonly wait: false
  readonly value: T
}

export function yesWait<T>(waitForIt: () => PromiseLike<T>): YesWait<T> {
  const promise = Promise.resolve(waitForIt())
  // This can keep the JS runtime from breaking if someone forgets to catch.
  // promise.then(() => {
  //   // Do nothing.
  // }, e => {
  //   console.log("Avoid that death trap")
  //   console.error(e)
  // })
  return {
    wait: true,
    promise,
  }
}
export function notWait<T>(value: T): NotWait<T> {
  return {
    wait: false,
    value,
  }
}
export function forwardWait<T, U>(
  source: MayWait<T>,
  process: (value: T) => U,
): MayWait<U> {
  if (!source.wait) {
    return {
      wait: false,
      value: process(source.value),
    }
  }
  return {
    wait: true,
    promise: source.promise.then(process),
  }
}

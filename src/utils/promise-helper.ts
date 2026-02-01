export function catchReject(
  promiseOrFunc: PromiseLike<unknown> | (() => PromiseLike<unknown>),
  handleError: (e: unknown) => void,
) {
  const promise = typeof promiseOrFunc === "function"
    ? promiseOrFunc()
    : promiseOrFunc
  promise.then(() => {
    // Do nothing.
  }, handleError)
}

import { Inputs, useEffect, useRef } from "preact/hooks"

export const inactivityMs = 5000

export function useSetIntervalWhenActive(
  callback: (() => void) | (() => PromiseLike<void>),
  ms: number,
  inputs: Inputs,
) {
  const lastMouse = useRef<number>(0)

  useEffect(() => {
    const move = () => (lastMouse.current = getNow())
    const out = () => (lastMouse.current = 0)
    globalThis.addEventListener("mousemove", move)
    globalThis.addEventListener("mouseout", out)
    return () => {
      globalThis.removeEventListener("mousemove", move)
      globalThis.removeEventListener("mouseout", out)
    }
  }, inputs)

  useEffect(() => {
    let outstandingCallback = false
    const handle = setInterval(function () {
      if (
        !outstandingCallback &&
        document.visibilityState === "visible" &&
        (document.hasFocus() || lastMouse.current + inactivityMs > getNow())
      ) {
        outstandingCallback = true
        Promise.resolve(callback()).finally(() => {
          outstandingCallback = false
        })
      }
    }, ms)
    return () => {
      clearInterval(handle)
    }
  }, inputs)
}

function getNow() {
  return new Date().getTime()
}

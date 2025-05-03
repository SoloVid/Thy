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
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseout", out)
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseout", out)
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

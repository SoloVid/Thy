import { useEffect, useState } from "preact/hooks"

export type ResizerProps = {
  resizeType: "horizontal" | "vertical"
  onResize: (details: { dx: number; dy: number }) => void
}

export default function Resizer({ resizeType, onResize }: ResizerProps) {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [trackingResize, setTrackingResize] = useState(false)

  useEffect(() => {
    if (!trackingResize) {
      return
    }
    const listener = (e: MouseEvent) => {
      setMousePos((prevPos) => {
        if (prevPos !== null) {
          const dx = e.clientX - prevPos.x
          const dy = e.clientY - prevPos.y
          onResize({ dx, dy })
        }
        return { x: e.clientX, y: e.clientY }
      })
    }
    window.addEventListener("mousemove", listener)
    return () => window.removeEventListener("mousemove", listener)
  }, [trackingResize])

  useEffect(() => {
    if (trackingResize) {
      const listener = () => {
        setTrackingResize(false)
      }
      window.addEventListener("mouseup", listener)
      return () => window.removeEventListener("mouseup", listener)
    }
  }, [trackingResize])

  function trackResize(e: MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY })
    setTrackingResize(true)
  }

  if (resizeType === "horizontal") {
    return (
      <div
        className="horizontal-resize-bar"
        onMouseDown={onlyLeft(trackResize, true)}
      ></div>
    )
  } else {
    return (
      <div
        className="vertical-resize-bar"
        onMouseDown={onlyLeft(trackResize, true)}
      ></div>
    )
  }
}

export function onlyLeft(
  handler: (e: MouseEvent) => void,
  preventDefault: boolean = false,
) {
  return (e: MouseEvent) => {
    if (e.button === 0) {
      handler(e)
    }
    if (preventDefault) {
      e.preventDefault()
    }
  }
}

// Implementation from https://github.com/jaredLunde/react-hook/blob/472fc4797dbd5a85fd87cb69a9c1ed8816367bf1/packages/latest/src/index.tsx

import { useEffect, useRef } from "preact/hooks"

const useLatest = <T extends unknown>(current: T) => {
  const storedValue = useRef(current)
  useEffect(() => {
    storedValue.current = current
  })
  return storedValue
}

export default useLatest

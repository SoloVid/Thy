import {
  compressToEncodedURIComponent as compressLz,
  decompressFromEncodedURIComponent as decompressLz,
} from "lz-string"
import { useEffect } from "preact/hooks"
import { SerializedWorkspace } from "../file/serialized-workspace"

export function useSourceCodePopStateListener(
  setState: (state: ReturnType<typeof getDataFromHistory>) => void,
) {
  useEffect(() => {
    const listener = (e: PopStateEvent) => {
      const state = getDataFromHistory()
      setState(state)
    }
    window.addEventListener("popstate", listener)
    return () => window.removeEventListener("popstate", listener)
  })
}

export function getDataFromHistory() {
  const { workspace = null } = (history.state ?? {}) as {
    workspace?: SerializedWorkspace | null
  }
  return workspace || null
}

export function saveCodeInHistory(
  fileName: string,
  newSource: string,
  language: string,
) {
  try {
    history.replaceState(
      {
        lz: compressLz(newSource),
        language: language,
        fileName: fileName,
      },
      "",
      window.location.pathname + window.location.search,
    )
  } catch (e) {
    // MDN warns that an exception could be thrown if the data is too big.
    // In that event, we just want to ignore the error.
    // Better to have no history than failing editor.

    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    )
  }
}

export function extractCodeFromHistoryState() {
  try {
    return getDataFromHistory()
  } catch (e) {
    console.error(e)
    window.alert(`Error parsing source in history state: ${e}`)
  }
  return null
}

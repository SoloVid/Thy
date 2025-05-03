import { useEffect, useMemo, useState } from "preact/hooks"

function getLocalStoragePreferences<T>(id: string): Partial<T> {
  const prefString = localStorage.getItem(id) ?? ""
  try {
    return JSON.parse(prefString) as Partial<T>
  } catch (e) {
    return {}
  }
}

function getSessionStoragePreferences<T>(id: string): Partial<T> {
  const prefString = sessionStorage.getItem(id) ?? ""
  try {
    return JSON.parse(prefString) as Partial<T>
  } catch (e) {
    return {}
  }
}

function getPreferences<T>(id: string, defaultPreferences: T): T {
  return {
    ...defaultPreferences,
    ...getLocalStoragePreferences(id),
    ...getSessionStoragePreferences(id),
  }
}

function setPreferences<T>(id: string, preferences: T): void {
  const prefString = JSON.stringify(preferences)
  sessionStorage.setItem(id, prefString)
  localStorage.setItem(id, prefString)
}

export function usePreferences<T>(
  id: string,
  defaultPreferences: T,
): [T, (transform: (before: T) => T) => void] {
  const [prefsInMemory, setPrefsInMemory] = useState(() =>
    getPreferences(id, defaultPreferences),
  )
  const [storedId, setStoredId] = useState(id)
  useEffect(() => {
    if (id !== storedId) {
      setPrefsInMemory(getPreferences(id, defaultPreferences))
      setStoredId(id)
    }
  }, [id, storedId])
  const setPrefs = useMemo<(transform: (before: T) => T) => void>(
    () => (transform) => {
      setPrefsInMemory((before) => {
        const after = transform(before)
        setPreferences(id, after)
        return after
      })
    },
    [id, setPrefsInMemory, setPreferences],
  )
  return [prefsInMemory, setPrefs]
}

type EditorPreferences = {
  leftOpen: boolean
  leftWidth: number
  rightOpen: boolean
  rightWidth: number
}

const defaultEditorPreferences: EditorPreferences = {
  leftOpen: true,
  leftWidth: 200,
  rightOpen: true,
  rightWidth: 500,
}

export function useEditorPreferences() {
  return usePreferences("editor-prefs", defaultEditorPreferences)
}

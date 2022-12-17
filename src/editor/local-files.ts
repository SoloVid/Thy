import { useState } from "preact/hooks"

const storageFilesListKey = "files"
const storageFileKeyPrefix = "file:"

export function useLocalFiles() {
  // This is only here to allow forcing re-render.
  const [version, setVersion] = useState(0)
  const bumpVersion = () => setVersion(before => before + 1)

  function getFilesList() {
    const filesJson = localStorage.getItem(storageFilesListKey) ?? "[]"
    return JSON.parse(filesJson) as string[]
  }
  function updateFilesList(newFilesList: readonly string[]) {
    localStorage.setItem(storageFilesListKey, JSON.stringify(newFilesList))
  }
  const files = getFilesList().sort()

  function getStorageKey(name: string) {
    return `${storageFileKeyPrefix}${name}`
  }

  function getFile(name: string) {
    return localStorage.getItem(getStorageKey(name))
  }

  function saveAsNew(sourceCode: string) {
    const name = window.prompt("File name?")
    if (!!name) {
      saveFile(name, sourceCode)
    }
    bumpVersion()
    return name
  }

  function saveFile(name: string, sourceCode: string) {
    localStorage.setItem(getStorageKey(name), sourceCode)
    const before = getFilesList()
    if (!before.includes(name)) {
      updateFilesList([...before, name])
    }
    bumpVersion()
  }

  function deleteFile(name: string) {
    if (!window.confirm(`Delete ${name}?`)) {
      return
    }
    localStorage.removeItem(getStorageKey(name))
    const before = getFilesList()
    updateFilesList(before.filter(f => f !== name))
    bumpVersion()
  }

  return {
    files: files as readonly string[],
    getFile,
    saveAsNew,
    saveFile,
    deleteFile,
  }
}

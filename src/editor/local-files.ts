import { useState } from "preact/hooks"

const storageFilesListKey = "files"
const storageFileKeyPrefix = "file:"

export function makeFileManager() {
  function getFilesList() {
    const filesJson = localStorage.getItem(storageFilesListKey) ?? "[]"
    return JSON.parse(filesJson) as string[]
  }
  function updateFilesList(newFilesList: readonly string[]) {
    localStorage.setItem(storageFilesListKey, JSON.stringify(newFilesList))
  }

  function getStorageKey(name: string) {
    return `${storageFileKeyPrefix}${name}`
  }

  function getFile(name: string) {
    return localStorage.getItem(getStorageKey(name))
  }

  function saveFile(name: string, sourceCode: string) {
    localStorage.setItem(getStorageKey(name), sourceCode)
    const before = getFilesList()
    if (!before.includes(name)) {
      updateFilesList([...before, name])
    }
  }

  function deleteFile(name: string) {
    localStorage.removeItem(getStorageKey(name))
    const before = getFilesList()
    updateFilesList(before.filter(f => f !== name))
  }

  return {
    getFilesList,
    getFile,
    saveFile,
    deleteFile,
  }
}

export function useLocalFiles(implementation: FileManager) {
  // This is only here to allow forcing re-render.
  const [version, setVersion] = useState(0)
  const bumpVersion = () => setVersion(before => before + 1)

  const files = implementation.getFilesList().sort()

  function saveAsNew(sourceCode: string) {
    const name = window.prompt("File name?")
    if (!!name) {
      implementation.saveFile(name, sourceCode)
    }
    bumpVersion()
    return name
  }

  function saveFile(name: string, sourceCode: string) {
    implementation.saveFile(name, sourceCode)
    bumpVersion()
  }

  function deleteFile(name: string) {
    if (!window.confirm(`Delete ${name}?`)) {
      return
    }
    implementation.deleteFile(name)
    bumpVersion()
  }

  return {
    files: files as readonly string[],
    getFile: implementation.getFile,
    saveAsNew,
    saveFile,
    deleteFile,
  }
}

export type FileManager = ReturnType<typeof makeFileManager>

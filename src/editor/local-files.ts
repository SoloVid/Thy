import { useState } from "preact/hooks"

const storageFilesListKey = "files"
const storageFileKeyPrefix = "file:"
const storageFileMetaKeyPrefix = "file-meta:"

export function makeFileManager() {
  function getFilesList() {
    const filesJson = localStorage.getItem(storageFilesListKey) ?? "[]"
    return JSON.parse(filesJson) as string[]
  }
  function updateFilesList(newFilesList: readonly string[]) {
    localStorage.setItem(storageFilesListKey, JSON.stringify(newFilesList))
  }

  function getStorageMetaKey(name: string) {
    return `${storageFileMetaKeyPrefix}${name}`
  }

  function getStorageKey(name: string) {
    return `${storageFileKeyPrefix}${name}`
  }

  function checkFileExists(name: string) {
    return localStorage.getItem(getStorageKey(name)) !== null
  }

  function getFile(name: string) {
    const contents = localStorage.getItem(getStorageKey(name))
    if (contents === null) {
      throw new Error(`File ${name} not found`)
    }
    return contents
  }

  function getMetadata(name: string): Record<string, string> {
    const rawMeta = localStorage.getItem(getStorageMetaKey(name))
    if (rawMeta === null) {
      return {}
    }
    return JSON.parse(rawMeta)
  }

  function saveFile(name: string, text: string, metadata: Record<string, string> = {}) {
    localStorage.setItem(getStorageKey(name), text)
    localStorage.setItem(getStorageMetaKey(name), JSON.stringify(metadata))
    const before = getFilesList()
    if (!before.includes(name)) {
      updateFilesList([...before, name])
    }
  }

  function deleteFile(name: string) {
    localStorage.removeItem(getStorageKey(name))
    localStorage.removeItem(getStorageMetaKey(name))
    const before = getFilesList()
    updateFilesList(before.filter(f => f !== name))
  }

  return {
    checkFileExists,
    getFilesList,
    getFile,
    getMetadata,
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

  function saveFile(name: string, sourceCode: string, metadata: Record<string, string> = {}) {
    implementation.saveFile(name, sourceCode, metadata)
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
    getMetadata: implementation.getMetadata,
    saveAsNew,
    saveFile,
    deleteFile,
  }
}

export type FileManager = ReturnType<typeof makeFileManager>

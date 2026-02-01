import type { FileManager } from "./local-files.ts"

export type FileEntry = {
  kind: "directory" | "file"
  name: string
  path: string
  timeModified: number
  size: number
}

export type FilesApi = {
  readonly exists: (path: string) => PromiseLike<boolean>
  readonly read: (path: string) => PromiseLike<string>
  readonly write: (path: string, contents: string) => PromiseLike<void>
  readonly list: (path: string) => PromiseLike<readonly FileEntry[]>
  readonly mkdir: (path: string) => PromiseLike<void>
  readonly rename: (oldPath: string, newPath: string) => PromiseLike<void>
  readonly delete: (path: string) => PromiseLike<void>
}

export function makeThyFilesApi(fileManager: FileManager) {
  return {
    exists: async (path: string) => fileManager.checkFileExists(path),
    read: async (name: string) => fileManager.getFile(name),
    write: async (name: string, contents: string) =>
      fileManager.saveFile(name, contents),
    list: async (directory: string) => fileManager.getFilesList(),
    delete: async (name: string) => fileManager.deleteFile(name),
  }
}

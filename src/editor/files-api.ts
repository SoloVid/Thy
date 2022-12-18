import type { FileManager } from "./local-files"

export function makeThyFilesApi(fileManager: FileManager) {
  return {
    read: async (name: string) => fileManager.getFile(name),
    write: async (name: string, contents: string) => fileManager.saveFile(name, contents),
    list: async () => fileManager.getFilesList(),
    delete: async (name: string) => fileManager.deleteFile(name),
  }
}

import FS from "@isomorphic-git/lightning-fs"
import type { FilesApi } from "./files-api.ts"

export type IndexedDbFiles = FilesApi

export function makeIndexedDbFiles(storeName: string): IndexedDbFiles {
  const fs = new FS(storeName)

  return {
    exists: async (path) => {
      try {
        await fs.promises.stat(path.replace(/\/$/, ""))
        return true
      } catch (e) {
        return false
      }
    },
    read: async (path) => {
      return fs.promises.readFile(path, "utf8")
    },
    write: async (path, contents) => {
      await fs.promises.writeFile(path, contents)
    },
    list: async (path) => {
      const childNames = await fs.promises.readdir(path.replace(/\/$/, ""))
      return Promise.all(
        childNames.map(async (c) => {
          const childPath = path + "/" + c
          const stat = await fs.promises.stat(childPath)
          return {
            kind: stat.isDirectory() ? "directory" : "file",
            name: c,
            path: childPath + (stat.isDirectory() ? "/" : ""),
            timeModified: stat.mtimeMs,
            size: stat.size,
          }
        }),
      )
    },
    mkdir: async (path) => {
      await fs.promises.mkdir(path)
    },
    rename: async (oldPath, newPath) => {
      // TODO: Maybe implement later?
      throw new Error("rename() is not implemented for IndexedDbFiles")
    },
    delete: async (path) => {
      await fs.promises.unlink(path.replace(/\/$/, ""))
    },
  }
}

import type { FilesApi } from "./files-api"

type Now = () => number

export type IndexedDbFiles2 = FilesApi

export function makeIndexedDbFiles2(now: Now, dbName: string, storeName: string): IndexedDbFiles2 {
  return {
    // TODO: Implement
  }
}

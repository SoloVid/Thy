export type NameFileEntry = {
  isDirectory: boolean
  name: string
}

export type PathFileEntry = {
  isDirectory: boolean
  path: string
}

export type FileBrowseApi = {
  readonly read: (path: string) => PromiseLike<string>
  readonly list: (path: string) => PromiseLike<readonly NameFileEntry[]>
}

// export type SyncFileBrowseApi = {
//   readonly read: (path: string) => string
//   readonly list: (path: string) => readonly NameFileEntry[]
// }

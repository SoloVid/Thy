
type FileNode = {
  readonly kind: "file"
  name: string
  path: string
  contents: string
  timeModified: number
}
type DirectoryNode = {
  readonly kind: "directory"
  name: string
  path: string
  children: (FileNode | DirectoryNode)[]
  timeModified: number
}

export type SerializedWorkspace = DirectoryNode

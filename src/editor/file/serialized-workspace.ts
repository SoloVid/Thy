export type SWFileNode = {
  readonly kind: "file"
  name: string
  contents: string
  timeModified: number
}
export type SWDirectoryNode = {
  readonly kind: "directory"
  name: string
  children: (SWFileNode | SWDirectoryNode)[]
  timeModified: number
}

export type SerializedWorkspaceNode = SWFileNode | SWDirectoryNode
export type SerializedWorkspace = SWDirectoryNode

export function makeWorkspaceFromScript(
  sourceCode: string = `return "himom"\n`,
): SerializedWorkspace {
  return {
    kind: "directory",
    name: "/",
    children: [
      {
        kind: "file",
        name: "main.thy",
        contents: sourceCode,
        timeModified: new Date().getTime(),
      },
    ],
    timeModified: new Date().getTime(),
  }
}

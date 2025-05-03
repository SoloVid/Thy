import assert from "utils/assert"
import type { FilesApi } from "./files-api"
import {
  SerializedWorkspace,
  SerializedWorkspaceNode,
  SWDirectoryNode,
  SWFileNode,
} from "./serialized-workspace"

type Now = () => number

type File = {
  readonly kind: "file"
  name: string
  readonly path: string
  contents: string
  parent: Directory
  timeModified: number
}
type Directory = {
  readonly kind: "directory"
  name: string
  readonly path: string
  children: (File | Directory)[]
  parent: Directory | null
  timeModified: number
}
export type SourceCodeWorkspace = Directory
export type SourceCodeWorkspaceNode = File | Directory

function makeFile(file: Omit<File, "kind" | "path">): File {
  return {
    kind: "file",
    ...file,
    get path() {
      return this.parent.path + this.name
    },
  }
}

function makeDirectory(file: Omit<Directory, "kind" | "path">): Directory {
  return {
    kind: "directory",
    ...file,
    get path() {
      if (!this.parent) {
        return "/"
      }
      return this.parent.path + this.name + "/"
    },
  }
}

function serializeNode(node: File | Directory): SerializedWorkspaceNode {
  if (node.kind === "directory") {
    return serializeDirectory(node)
  } else {
    return serializeFile(node)
  }
}
function serializeDirectory(node: Directory): SWDirectoryNode {
  const { path, parent, children, ...everythingElse } = node
  return {
    children: children.map(serializeNode),
    ...everythingElse,
  }
}
function serializeFile(node: File): SWFileNode {
  const { path, parent, ...everythingElse } = node
  return everythingElse
}

function deserializeNode(
  node: SerializedWorkspaceNode,
  parent: Directory,
): File | Directory {
  if (node.kind === "directory") {
    return deserializeDirectory(node, parent)
  } else {
    return deserializeFile(node, parent)
  }
}
function deserializeDirectory(
  node: SWDirectoryNode,
  parent: Directory | null,
): Directory {
  const { children, ...everythingElse } = node
  const inflated: Directory = makeDirectory({
    ...node,
    children: [],
    parent,
  })
  inflated.children = node.children.map((c) => deserializeNode(c, inflated))
  return inflated
}
function deserializeFile(node: SWFileNode, parent: Directory): File {
  return makeFile({
    ...node,
    parent,
  })
}

function findNode(
  now: Now,
  root: Directory,
  path: string,
  createIfMissing: boolean = false,
): File | Directory | null {
  const parts = path.split("/").filter((p) => p.length > 0)
  let current: Directory = root

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === ".") continue
    if (parts[i] === "..") {
      assert(!!current.parent, "Cannot go up from root")
      current = current.parent
      continue
    }
    const child = current.children.find((c) => c.name === parts[i])
    if (i === parts.length - 1) {
      if (!child && createIfMissing) {
        const newChild = makeFile({
          name: parts[i],
          contents: "",
          parent: current,
          timeModified: now(),
        })
        current.children.push(newChild)
        return newChild
      }
      return child ?? null
    }
    if (!child) return null
    if (child.kind !== "directory") return null
    current = child
  }
  return current
}

function findParentDirectory(
  now: Now,
  root: Directory,
  path: string,
): Directory {
  const parent = findNode(
    now,
    root,
    path.replace(/\/$/, "").split("/").slice(0, -1).join("/"),
  )
  if (!parent) throw new Error(`File ${path} not found`)
  if (parent.kind !== "directory") throw new Error(`${path} is not a directory`)
  return parent
}

export type InMemoryFiles = FilesApi & {
  getRaw: () => Directory
  setRaw: (raw: Directory) => void
  serialize: () => SerializedWorkspace
  ingest: (serialized: SerializedWorkspace) => void
}

export function makeInMemoryFiles(now: Now): InMemoryFiles {
  let root: Directory = makeDirectory({
    name: "/",
    children: [],
    parent: null,
    timeModified: now(),
  })

  return {
    getRaw: () => root,
    setRaw: (raw: Directory) => {
      root = raw
    },
    serialize: () => {
      return serializeDirectory(root)
    },
    ingest: (serialized) => {
      root = deserializeDirectory(serialized, null)
    },
    exists: async (path: string) => {
      return findNode(now, root, path) !== null
    },
    read: async (path: string) => {
      const node = findNode(now, root, path)
      assert(!!node, `File ${path} not found`)
      assert(node.kind === "file", `${path} is a directory`)
      return node.contents
    },
    write: async (path: string, contents: string) => {
      const node = findNode(now, root, path, true)
      assert(!!node, `File ${path} not found`)
      assert(node.kind === "file", `${path} is a directory`)
      node.contents = contents
      node.timeModified = now()
    },
    list: async (path: string) => {
      const node = findNode(now, root, path)
      assert(!!node, `File ${path} not found`)
      assert(node.kind === "directory", `${path} is a file`)
      return node.children.map((c) => ({
        kind: c.kind,
        name: c.name,
        path: c.path,
        timeModified: c.timeModified,
        size: c.kind === "file" ? c.contents.length : 0,
      }))
    },
    mkdir: async (path: string) => {
      const parent = findParentDirectory(now, root, path)
      const name = path.replace(/\/$/, "").split("/").pop()
      assert(!!name, "Directory name is required")
      assert(
        !parent.children.some((c) => c.name === name),
        "Directory already exists",
      )
      parent.children.push(
        makeDirectory({
          name,
          children: [],
          parent: parent,
          timeModified: now(),
        }),
      )
    },
    rename: async (oldPath: string, newPath: string) => {
      if (oldPath === newPath) return
      console.log(serializeDirectory(root))
      console.log(`${oldPath} -> ${newPath}`)
      const node = findNode(now, root, oldPath)
      assert(!!node, `File ${oldPath} not found`)
      const oldParent = node.parent
      assert(!!oldParent, "Cannot rename root")
      const newParent = findParentDirectory(now, root, newPath)
      const name = newPath
        .split("/")
        .filter((s) => !!s)
        .pop()
      assert(!!name, "File name is required")
      assert(
        !newParent.children.some((c) => c.name === name),
        "File already exists",
      )
      node.parent = newParent
      node.name = name
      node.timeModified = now()
      oldParent.children = oldParent.children.filter((c) => c !== node)
      newParent.children.push(node)
    },
    delete: async (path: string) => {
      const parent = findParentDirectory(now, root, path)
      parent.children = parent.children.filter(
        (c) => c.name !== path.replace(/\/$/, "").split("/").pop()!,
      )
    },
  }
}

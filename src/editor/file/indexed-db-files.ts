import assert from "utils/assert"
import type { FilesApi } from "./files-api"
import {
  SerializedWorkspace,
  SerializedWorkspaceNode,
  SWDirectoryNode,
  SWFileNode,
} from "./serialized-workspace"

const DB_NAME = "files_db"
const DB_VERSION = 1
const WORKSPACE_STORE = "workspace"

type File = {
  readonly kind: "file"
  name: string
  contents: string
  timeModified: number
}

type Directory = {
  readonly kind: "directory"
  name: string
  children: (File | Directory)[]
  timeModified: number
}

type WorkspaceNode = File | Directory

// Helper function to open the database
async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(WORKSPACE_STORE)) {
        db.createObjectStore(WORKSPACE_STORE, { keyPath: "path" })
      }
    }
  })
}

// Helper function to perform database operations
async function dbOperation<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(WORKSPACE_STORE, mode)
    const store = transaction.objectStore(WORKSPACE_STORE)
    const request = operation(store)
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Helper function to find a node by path
function findNode(
  root: Directory,
  path: string,
  createIfMissing: boolean = false
): WorkspaceNode | null {
  if (path === "/" || path === "") return root
  
  const parts = path.split("/").filter(p => p.length > 0)
  let current: Directory = root
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const child = current.children.find(c => c.name === part)
    
    if (!child) {
      if (!createIfMissing) return null
      
      // Only create missing files at the end of the path
      if (i === parts.length - 1) {
        const newFile: File = {
          kind: "file",
          name: part,
          contents: "",
          timeModified: Date.now()
        }
        current.children.push(newFile)
        return newFile
      }
      
      // Create missing directories along the way
      const newDir: Directory = {
        kind: "directory",
        name: part,
        children: [],
        timeModified: Date.now()
      }
      current.children.push(newDir)
      current = newDir
    } else {
      if (i === parts.length - 1) return child
      if (child.kind !== "directory") return null
      current = child
    }
  }
  
  return current
}

// Helper function to get parent directory path
function getParentPath(path: string): string {
  return path.split("/").slice(0, -1).join("/") || "/"
}

// Helper function to get node name from path
function getNodeName(path: string): string {
  return path.split("/").pop() || "/"
}

// Helper function to find parent directory
function findParentDirectory(
  root: Directory,
  path: string
): Directory | null {
  const parentPath = getParentPath(path)
  const parent = findNode(root, parentPath)
  if (!parent || parent.kind !== "directory") return null
  return parent
}

// Serialize a workspace node to a serialized workspace node
function serializeNode(node: WorkspaceNode): SerializedWorkspaceNode {
  if (node.kind === "directory") {
    return {
      kind: "directory",
      name: node.name,
      children: node.children.map(serializeNode),
      timeModified: node.timeModified
    }
  } else {
    return {
      kind: "file",
      name: node.name,
      content: node.contents,
      timeModified: node.timeModified
    }
  }
}

// Deserialize a serialized workspace node to a workspace node
function deserializeNode(node: SerializedWorkspaceNode): WorkspaceNode {
  if (node.kind === "directory") {
    return {
      kind: "directory",
      name: node.name,
      children: node.children.map(deserializeNode),
      timeModified: node.timeModified
    }
  } else {
    return {
      kind: "file",
      name: node.name,
      contents: node.content,
      timeModified: node.timeModified
    }
  }
}

export type IndexedDbFiles = FilesApi & {
  serialize: () => Promise<SerializedWorkspace>
  ingest: (serialized: SerializedWorkspace) => Promise<void>
}

export function makeIndexedDbFiles(): IndexedDbFiles {
  // Initialize the root directory if it doesn't exist
  const initRoot = async (): Promise<Directory> => {
    try {
      const rootData = await dbOperation("readonly", store => 
        store.get("root")
      )
      
      if (rootData) {
        return rootData.workspace
      }
    } catch (error) {
      // If there's an error, create a new root
    }
    
    // Create default workspace with example files
    const root: Directory = {
      kind: "directory",
      name: "/",
      children: [
        {
          kind: "file",
          name: "example-workspace.json",
          contents: JSON.stringify({
            type: "directory",
            name: "",
            children: [
              {
                type: "file",
                name: "main.thy",
                content: "let greeting = \"Hello, Thy!\"\nreturn greeting"
              },
              {
                type: "directory",
                name: "examples",
                children: [
                  {
                    type: "file",
                    name: "factorial.thy",
                    content: "let factorial = function n\n  if n == 0\n    return 1\n  return n * factorial(n - 1)"
                  }
                ]
              }
            ]
          }, null, 2),
          timeModified: Date.now()
        }
      ],
      timeModified: Date.now()
    }
    
    await dbOperation("readwrite", store => 
      store.put({ path: "root", workspace: root })
    )
    
    return root
  }
  
  // Get the root directory (initializing if needed)
  const getRoot = async (): Promise<Directory> => {
    return await initRoot()
  }
  
  // Save the root directory
  const saveRoot = async (root: Directory): Promise<void> => {
    await dbOperation("readwrite", store => 
      store.put({ path: "root", workspace: root })
    )
  }
  
  return {
    serialize: async () => {
      const root = await getRoot()
      return serializeNode(root) as SerializedWorkspace
    },
    
    ingest: async (serialized: SerializedWorkspace) => {
      const root = deserializeNode(serialized) as Directory
      await saveRoot(root)
    },
    
    exists: async (path: string) => {
      const root = await getRoot()
      return findNode(root, path) !== null
    },
    
    read: async (path: string) => {
      const root = await getRoot()
      const node = findNode(root, path)
      assert(!!node, `File ${path} not found`)
      assert(node.kind === "file", `${path} is a directory`)
      return node.contents
    },
    
    write: async (path: string, contents: string) => {
      const root = await getRoot()
      
      // Check if file exists
      let node = findNode(root, path, true)
      assert(!!node, `Failed to create file ${path}`)
      
      if (node.kind === "file") {
        node.contents = contents
        node.timeModified = Date.now()
      } else {
        assert(false, `${path} is a directory`)
      }
      
      await saveRoot(root)
    },
    
    list: async (path: string) => {
      const root = await getRoot()
      const node = findNode(root, path)
      assert(!!node, `Path ${path} not found`)
      assert(node.kind === "directory", `${path} is not a directory`)
      
      return node.children.map(child => ({
        kind: child.kind,
        name: child.name,
        timeModified: child.timeModified
      }))
    },
    
    mkdir: async (path: string) => {
      if (path === "/") return
      
      const root = await getRoot()
      const parentPath = getParentPath(path)
      const name = getNodeName(path)
      
      // Create parent directories if they don't exist
      let parent = findNode(root, parentPath)
      if (!parent) {
        await api.mkdir(parentPath)
        // Get the updated root and parent after creating parent directories
        const updatedRoot = await getRoot()
        parent = findNode(updatedRoot, parentPath)
      }
      
      assert(!!parent, `Parent directory ${parentPath} not found`)
      assert(parent.kind === "directory", `${parentPath} is not a directory`)
      
      // Check if directory already exists
      if (!parent.children.some(c => c.name === name)) {
        parent.children.push({
          kind: "directory",
          name,
          children: [],
          timeModified: Date.now()
        })
        
        await saveRoot(root)
      }
    },
    
    rename: async (oldPath: string, newPath: string) => {
      if (oldPath === newPath) return
      
      const root = await getRoot()
      const node = findNode(root, oldPath)
      assert(!!node, `File ${oldPath} not found`)
      
      const oldParent = findParentDirectory(root, oldPath)
      assert(!!oldParent, "Cannot rename root")
      
      const newParent = findParentDirectory(root, newPath)
      assert(!!newParent, `New parent directory not found`)
      
      const newName = getNodeName(newPath)
      assert(!newParent.children.some(c => c.name === newName), `${newPath} already exists`)
      
      // Remove from old parent
      oldParent.children = oldParent.children.filter(c => c !== node)
      
      // Update node name and add to new parent
      node.name = newName
      node.timeModified = Date.now()
      newParent.children.push(node)
      
      await saveRoot(root)
    },
    
    delete: async (path: string) => {
      const root = await getRoot()
      const parent = findParentDirectory(root, path)
      assert(!!parent, `Parent directory not found for ${path}`)
      
      const name = getNodeName(path)
      parent.children = parent.children.filter(c => c.name !== name)
      
      await saveRoot(root)
    }
  }
}

const api = makeIndexedDbFiles()
export type IndexedDbFiles = FilesApi

import assert from "utils/assert"
import type { FilesApi } from "./files-api"

const DB_NAME = "files_db"
const DB_VERSION = 1

// Store names
const PATH_STORE = "paths"
const NODE_STORE = "nodes"

type NodeId = string

interface BaseNode {
  id: NodeId
  name: string
  parentId: NodeId | null
}

interface FileNode extends BaseNode {
  type: "file"
  contents: string
}

interface DirectoryNode extends BaseNode {
  type: "directory"
  childIds: NodeId[]
}

type Node = FileNode | DirectoryNode

interface PathEntry {
  path: string
  nodeId: NodeId
}

type StoreNames = typeof PATH_STORE | typeof NODE_STORE
type StoreSchema = {
  [PATH_STORE]: PathEntry
  [NODE_STORE]: Node
}

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(NODE_STORE)) {
        const nodeStore = db.createObjectStore(NODE_STORE, { keyPath: "id" })
        nodeStore.createIndex("parentId", "parentId")
      }

      if (!db.objectStoreNames.contains(PATH_STORE)) {
        const pathStore = db.createObjectStore(PATH_STORE, { keyPath: "path" })
        pathStore.createIndex("nodeId", "nodeId")
      }
    }
  })
}

async function dbOperation<S extends StoreNames, T>(
  storeName: S,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = operation(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function generateId(): NodeId {
  return crypto.randomUUID()
}

function getParentPath(path: string): string {
  return path.split("/").slice(0, -1).join("/") || "/"
}

function getNodeName(path: string): string {
  return path.split("/").pop() || "/"
}

export function makeIndexedDbFiles(): FilesApi {
  // Initialize root if it doesn't exist
  const initRoot = async () => {
    const rootExists = await dbOperation(PATH_STORE, "readonly", (store) =>
      store.get("/"),
    )

    if (!rootExists) {
      const rootId = generateId()
      const rootNode: DirectoryNode = {
        id: rootId,
        type: "directory",
        name: "/",
        parentId: null,
        childIds: [],
      }

      await dbOperation(NODE_STORE, "readwrite", (store) => store.put(rootNode))

      await dbOperation(PATH_STORE, "readwrite", (store) =>
        store.put({ path: "/", nodeId: rootId }),
      )
    }
  }

  initRoot()

  async function getNodeByPath(path: string): Promise<Node> {
    const pathEntry = await dbOperation(PATH_STORE, "readonly", (store) =>
      store.get(path),
    )
    assert(pathEntry, `Path ${path} not found`)

    const node = await dbOperation(NODE_STORE, "readonly", (store) =>
      store.get(pathEntry.nodeId),
    )
    assert(node, `Node ${pathEntry.nodeId} not found`)

    return node
  }

  async function addNode(path: string, node: Node): Promise<void> {
    // Add the node
    await dbOperation(NODE_STORE, "readwrite", (store) => store.put(node))

    // Add the path entry
    await dbOperation(PATH_STORE, "readwrite", (store) =>
      store.put({ path, nodeId: node.id }),
    )

    // Update parent's childIds if this isn't the root
    if (node.parentId) {
      const parent = (await dbOperation(NODE_STORE, "readonly", (store) =>
        store.get(node.parentId),
      )) as DirectoryNode

      await dbOperation(NODE_STORE, "readwrite", (store) =>
        store.put({
          ...parent,
          childIds: [...parent.childIds, node.id],
        }),
      )
    }
  }

  return {
    exists: async (path: string) => {
      const entry = await dbOperation(PATH_STORE, "readonly", (store) =>
        store.get(path),
      )
      return !!entry
    },

    read: async (path: string) => {
      const node = await getNodeByPath(path)
      assert(node.type === "file", `${path} is a directory`)
      return node.contents
    },

    write: async (path: string, contents: string) => {
      const parentPath = getParentPath(path)
      const parent = await getNodeByPath(parentPath)
      assert(parent.type === "directory", `${parentPath} is not a directory`)

      const fileId = generateId()
      const fileNode: FileNode = {
        id: fileId,
        type: "file",
        name: getNodeName(path),
        parentId: parent.id,
        contents,
      }

      await addNode(path, fileNode)
    },

    list: async (path: string) => {
      const node = await getNodeByPath(path)
      assert(node.type === "directory", `${path} is not a directory`)

      const children = await Promise.all(
        node.childIds.map((id) =>
          dbOperation(NODE_STORE, "readonly", (store) => store.get(id)),
        ),
      )

      return children.map((child) => child.name)
    },

    mkdir: async (path: string) => {
      const parentPath = getParentPath(path)
      const parent = await getNodeByPath(parentPath)
      assert(parent.type === "directory", `${parentPath} is not a directory`)

      const exists = await dbOperation(PATH_STORE, "readonly", (store) =>
        store.get(path),
      )
      assert(!exists, `${path} already exists`)

      const dirId = generateId()
      const dirNode: DirectoryNode = {
        id: dirId,
        type: "directory",
        name: getNodeName(path),
        parentId: parent.id,
        childIds: [],
      }

      await addNode(path, dirNode)
    },

    rename: async (oldPath: string, newPath: string) => {
      const node = await getNodeByPath(oldPath)
      const newParentPath = getParentPath(newPath)
      const newParent = await getNodeByPath(newParentPath)
      assert(
        newParent.type === "directory",
        `${newParentPath} is not a directory`,
      )

      const exists = await dbOperation(PATH_STORE, "readonly", (store) =>
        store.get(newPath),
      )
      assert(!exists, `${newPath} already exists`)

      // Update the node's name and parent
      const updatedNode: Node = {
        ...node,
        name: getNodeName(newPath),
        parentId: newParent.id,
      }

      // Remove from old parent's childIds
      if (node.parentId) {
        const oldParent = (await dbOperation(NODE_STORE, "readonly", (store) =>
          store.get(node.parentId),
        )) as DirectoryNode

        await dbOperation(NODE_STORE, "readwrite", (store) =>
          store.put({
            ...oldParent,
            childIds: oldParent.childIds.filter((id) => id !== node.id),
          }),
        )
      }

      // Add to new parent's childIds
      await dbOperation(NODE_STORE, "readwrite", (store) =>
        store.put({
          ...newParent,
          childIds: [...newParent.childIds, node.id],
        }),
      )

      // Update the node
      await dbOperation(NODE_STORE, "readwrite", (store) =>
        store.put(updatedNode),
      )

      // Update path entries
      await dbOperation(PATH_STORE, "readwrite", (store) =>
        store.delete(oldPath),
      )
      await dbOperation(PATH_STORE, "readwrite", (store) =>
        store.put({ path: newPath, nodeId: node.id }),
      )

      // If it's a directory, update all descendant paths
      if (node.type === "directory") {
        const allPaths = await dbOperation(PATH_STORE, "readonly", (store) =>
          store.getAll(),
        )

        for (const pathEntry of allPaths) {
          if (pathEntry.path.startsWith(oldPath + "/")) {
            const newChildPath = newPath + pathEntry.path.slice(oldPath.length)
            await dbOperation(PATH_STORE, "readwrite", (store) =>
              store.delete(pathEntry.path),
            )
            await dbOperation(PATH_STORE, "readwrite", (store) =>
              store.put({ path: newChildPath, nodeId: pathEntry.nodeId }),
            )
          }
        }
      }
    },

    delete: async (path: string) => {
      const node = await getNodeByPath(path)

      // Remove from parent's childIds
      if (node.parentId) {
        const parent = (await dbOperation(NODE_STORE, "readonly", (store) =>
          store.get(node.parentId),
        )) as DirectoryNode

        await dbOperation(NODE_STORE, "readwrite", (store) =>
          store.put({
            ...parent,
            childIds: parent.childIds.filter((id) => id !== node.id),
          }),
        )
      }

      // Delete the node and its path entry
      await dbOperation(NODE_STORE, "readwrite", (store) =>
        store.delete(node.id),
      )
      await dbOperation(PATH_STORE, "readwrite", (store) => store.delete(path))

      // If it's a directory, recursively delete all descendants
      if (node.type === "directory") {
        const allPaths = await dbOperation(PATH_STORE, "readonly", (store) =>
          store.getAll(),
        )

        for (const pathEntry of allPaths) {
          if (pathEntry.path.startsWith(path + "/")) {
            await dbOperation(NODE_STORE, "readwrite", (store) =>
              store.delete(pathEntry.nodeId),
            )
            await dbOperation(PATH_STORE, "readwrite", (store) =>
              store.delete(pathEntry.path),
            )
          }
        }
      }
    },
  }
}

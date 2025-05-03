import type { FilesApi, FileEntry } from "./files-api"
import type { SerializedWorkspace } from "./serialized-workspace"

type Now = () => number

export type IndexedDbFiles2 = FilesApi & {
  serialize: () => Promise<SerializedWorkspace>
  ingest: (serialized: SerializedWorkspace) => Promise<void>
}

// File system node types
type FSNode = {
  path: string
  name: string
  timeModified: number
  parent: string | null
}

type FSFile = FSNode & {
  kind: "file"
  contents: string
  size: number
}

type FSDirectory = FSNode & {
  kind: "directory"
  size: 0
}

// Helper to open the database connection
function openDb(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)
    
    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains("files")) {
        const store = db.createObjectStore("files", { keyPath: "path" })
        store.createIndex("by-parent", "parent")
      }
    }
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Helper for database operations
function dbOperation<T>(
  db: IDBDatabase, 
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = operation(store)
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Helper to ensure a directory exists
async function ensureDirectoryExists(
  db: IDBDatabase, 
  storeName: string,
  path: string, 
  now: Now
): Promise<void> {
  if (path === "/" || path === "") return
  
  const exists = await dbOperation(db, storeName, "readonly", (store) => 
    store.get(path)
  )
  
  if (!exists) {
    const parts = path.split("/").filter(Boolean)
    const name = parts[parts.length - 1]
    const parentPath = parts.length > 1 ? "/" + parts.slice(0, -1).join("/") : "/"
    
    // Ensure parent exists first
    await ensureDirectoryExists(db, storeName, parentPath, now)
    
    const directory: FSDirectory = {
      kind: "directory",
      path,
      name,
      parent: parentPath === "/" ? null : parentPath,
      timeModified: now(),
      size: 0
    }
    
    await dbOperation(db, storeName, "readwrite", (store) => 
      store.put(directory)
    )
  }
}

// Helper to get all children of a directory
async function getChildren(
  db: IDBDatabase, 
  storeName: string,
  path: string
): Promise<(FSFile | FSDirectory)[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const index = store.index("by-parent")
    const parentPath = path === "/" ? null : path
    const request = index.getAll(parentPath)
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Helper to normalize paths
function normalizePath(path: string): string {
  if (!path.startsWith("/")) path = "/" + path
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path
}

// Helper to get parent path
function getParentPath(path: string): string {
  const parts = path.split("/").filter(Boolean)
  return parts.length > 0 ? "/" + parts.slice(0, -1).join("/") : "/"
}

// Helper to get name from path
function getNameFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : ""
}

// Convert FSNode to FileEntry
function toFileEntry(node: FSFile | FSDirectory): FileEntry {
  return {
    kind: node.kind,
    name: node.name,
    path: node.path,
    timeModified: node.timeModified,
    size: node.size
  }
}

// Implementation of the file system API
export function makeIndexedDbFiles2(now: Now, dbName: string, storeName: string): IndexedDbFiles2 {
  let dbPromise: Promise<IDBDatabase> | null = null
  
  // Ensure we have a database connection
  function getDb(): Promise<IDBDatabase> {
    if (!dbPromise) {
      dbPromise = openDb(dbName)
    }
    return dbPromise
  }
  
  // Initialize root directory if needed
  async function initRoot(): Promise<void> {
    const db = await getDb()
    const root = await dbOperation(db, storeName, "readonly", (store) => 
      store.get("/")
    )
    
    if (!root) {
      const rootDir: FSDirectory = {
        kind: "directory",
        path: "/",
        name: "",
        parent: null,
        timeModified: now(),
        size: 0
      }
      
      await dbOperation(db, storeName, "readwrite", (store) => 
        store.put(rootDir)
      )
    }
  }
  
  // Recursively delete a node and all its children
  async function recursiveDelete(db: IDBDatabase, path: string): Promise<void> {
    const node = await dbOperation(db, storeName, "readonly", (store) => 
      store.get(path)
    )
    
    if (!node) return
    
    if (node.kind === "directory") {
      const children = await getChildren(db, storeName, path)
      for (const child of children) {
        await recursiveDelete(db, child.path)
      }
    }
    
    await dbOperation(db, storeName, "readwrite", (store) => 
      store.delete(path)
    )
  }
  
  // Convert to SerializedWorkspace format
  async function toSerializedWorkspace(
    db: IDBDatabase, 
    path: string = "/"
  ): Promise<SerializedWorkspace> {
    const node = await dbOperation(db, storeName, "readonly", (store) => 
      store.get(path)
    ) as FSDirectory
    
    if (!node || node.kind !== "directory") {
      throw new Error(`Path ${path} is not a directory`)
    }
    
    const children = await getChildren(db, storeName, path)
    const serializedChildren = []
    
    for (const child of children) {
      if (child.kind === "directory") {
        serializedChildren.push(await toSerializedWorkspace(db, child.path))
      } else {
        serializedChildren.push({
          kind: "file",
          name: child.name,
          contents: (child as FSFile).contents,
          timeModified: child.timeModified
        })
      }
    }
    
    return {
      kind: "directory",
      name: node.name,
      children: serializedChildren,
      timeModified: node.timeModified
    }
  }
  
  // Process SerializedWorkspace for ingestion
  async function processSerializedWorkspace(
    db: IDBDatabase,
    node: SerializedWorkspace,
    parentPath: string = ""
  ): Promise<void> {
    const path = parentPath === "/" 
      ? `/${node.name}` 
      : `${parentPath}/${node.name}`
    
    const directory: FSDirectory = {
      kind: "directory",
      path,
      name: node.name,
      parent: parentPath === "" ? null : parentPath,
      timeModified: node.timeModified,
      size: 0
    }
    
    await dbOperation(db, storeName, "readwrite", (store) => 
      store.put(directory)
    )
    
    for (const child of node.children) {
      if (child.kind === "directory") {
        await processSerializedWorkspace(db, child, path)
      } else {
        const filePath = `${path}/${child.name}`
        const file: FSFile = {
          kind: "file",
          path: filePath,
          name: child.name,
          parent: path,
          contents: child.contents,
          timeModified: child.timeModified,
          size: child.contents.length
        }
        
        await dbOperation(db, storeName, "readwrite", (store) => 
          store.put(file)
        )
      }
    }
  }
  
  // Initialize the root directory
  initRoot().catch(console.error)
  
  return {
    exists: async (path: string): Promise<boolean> => {
      path = normalizePath(path)
      const db = await getDb()
      const node = await dbOperation(db, storeName, "readonly", (store) => 
        store.get(path)
      )
      return !!node
    },
    
    read: async (path: string): Promise<string> => {
      path = normalizePath(path)
      const db = await getDb()
      const file = await dbOperation(db, storeName, "readonly", (store) => 
        store.get(path)
      ) as FSFile | undefined
      
      if (!file || file.kind !== "file") {
        throw new Error(`File not found: ${path}`)
      }
      
      return file.contents
    },
    
    write: async (path: string, contents: string): Promise<void> => {
      path = normalizePath(path)
      const db = await getDb()
      const parentPath = getParentPath(path)
      
      // Ensure parent directory exists
      await ensureDirectoryExists(db, storeName, parentPath, now)
      
      const name = getNameFromPath(path)
      const file: FSFile = {
        kind: "file",
        path,
        name,
        parent: parentPath === "/" ? null : parentPath,
        contents,
        timeModified: now(),
        size: contents.length
      }
      
      await dbOperation(db, storeName, "readwrite", (store) => 
        store.put(file)
      )
    },
    
    list: async (path: string): Promise<readonly FileEntry[]> => {
      path = normalizePath(path)
      const db = await getDb()
      
      // Check if the directory exists
      const dir = await dbOperation(db, storeName, "readonly", (store) => 
        store.get(path)
      )
      
      if (!dir || dir.kind !== "directory") {
        throw new Error(`Directory not found: ${path}`)
      }
      
      const children = await getChildren(db, storeName, path)
      return children.map(toFileEntry)
    },
    
    mkdir: async (path: string): Promise<void> => {
      path = normalizePath(path)
      const db = await getDb()
      
      // Check if it already exists
      const existing = await dbOperation(db, storeName, "readonly", (store) => 
        store.get(path)
      )
      
      if (existing) {
        if (existing.kind === "directory") {
          return // Directory already exists
        }
        throw new Error(`Path exists but is not a directory: ${path}`)
      }
      
      await ensureDirectoryExists(db, storeName, path, now)
    },
    
    rename: async (oldPath: string, newPath: string): Promise<void> => {
      oldPath = normalizePath(oldPath)
      newPath = normalizePath(newPath)
      
      const db = await getDb()
      
      // Check if source exists
      const node = await dbOperation(db, storeName, "readonly", (store) => 
        store.get(oldPath)
      ) as (FSFile | FSDirectory) | undefined
      
      if (!node) {
        throw new Error(`Path not found: ${oldPath}`)
      }
      
      // Check if destination parent exists
      const newParentPath = getParentPath(newPath)
      await ensureDirectoryExists(db, storeName, newParentPath, now)
      
      // Check if destination already exists
      const destExists = await dbOperation(db, storeName, "readonly", (store) => 
        store.get(newPath)
      )
      
      if (destExists) {
        throw new Error(`Destination already exists: ${newPath}`)
      }
      
      if (node.kind === "file") {
        // For files, just create a new entry and delete the old one
        const newFile: FSFile = {
          ...node,
          path: newPath,
          name: getNameFromPath(newPath),
          parent: newParentPath === "/" ? null : newParentPath,
          timeModified: now()
        }
        
        await dbOperation(db, storeName, "readwrite", (store) => {
          store.put(newFile)
          return store.delete(oldPath)
        })
      } else {
        // For directories, we need to recursively update all children
        const children = await getChildren(db, storeName, oldPath)
        
        // Create the new directory
        const newDir: FSDirectory = {
          ...node,
          path: newPath,
          name: getNameFromPath(newPath),
          parent: newParentPath === "/" ? null : newParentPath,
          timeModified: now()
        }
        
        await dbOperation(db, storeName, "readwrite", (store) => 
          store.put(newDir)
        )
        
        // Update all children recursively
        for (const child of children) {
          const childNewPath = child.path.replace(oldPath, newPath)
          await dbOperation(db, storeName, "readwrite", (store) => {
            store.put({
              ...child,
              path: childNewPath,
              parent: newPath
            })
            return store.delete(child.path)
          })
        }
        
        // Delete the old directory
        await dbOperation(db, storeName, "readwrite", (store) => 
          store.delete(oldPath)
        )
      }
    },
    
    delete: async (path: string): Promise<void> => {
      path = normalizePath(path)
      const db = await getDb()
      await recursiveDelete(db, path)
    },
    
    serialize: async (): Promise<SerializedWorkspace> => {
      const db = await getDb()
      return toSerializedWorkspace(db)
    },
    
    ingest: async (serialized: SerializedWorkspace): Promise<void> => {
      const db = await getDb()
      
      // Clear existing data
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      // Create root directory
      const rootDir: FSDirectory = {
        kind: "directory",
        path: "/",
        name: "",
        parent: null,
        timeModified: now(),
        size: 0
      }
      
      await dbOperation(db, storeName, "readwrite", (store) => 
        store.put(rootDir)
      )
      
      // Process the serialized workspace
      for (const child of serialized.children) {
        if (child.kind === "directory") {
          await processSerializedWorkspace(db, child, "/")
        } else {
          const file: FSFile = {
            kind: "file",
            path: `/${child.name}`,
            name: child.name,
            parent: "/",
            contents: child.contents,
            timeModified: child.timeModified,
            size: child.contents.length
          }
          
          await dbOperation(db, storeName, "readwrite", (store) => 
            store.put(file)
          )
        }
      }
    }
  }
}

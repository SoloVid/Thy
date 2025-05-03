import {
  faFileCirclePlus,
  faFolderPlus,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAlerts } from "editor/alert-provider"
import { useSetIntervalWhenActive } from "editor/hook/use-set-interval-when-active"
import { MutableRef, useEffect, useMemo, useRef, useState } from "preact/hooks"
import { stringifyError } from "utils/stringify-error"
import { FileEntry, FilesApi } from "../files-api"
import { FileTreeNode } from "./file-tree-node"
import { RenameState } from "./rename"
import { actionStyle } from "./shared-style"
import { generateUniqueName } from "../generate-unique-name"

type SharedProps = {
  fs: FilesApi
  onSelect: (newPath: string) => void
  onDelete: (path: string) => void
  onRename: (oldPath: string, newPath: string) => void
}

type SharedChildProps = SharedProps & {
  selectedPath: string | null
  setSelectedPath: (newPath: string | null) => void
  renameState: RenameState
  setRenameState: (state: RenameState) => void
  renameInProgressRef: MutableRef<boolean>
  expandedDirs: Readonly<Set<string>>
  setExpandedDirs: (dirs: Readonly<Set<string>>) => void
}

type FileTreeProps = SharedProps & {
  directory: string
}

// FileTree component
export const FileTree = (props: FileTreeProps) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [renameState, setRenameState] = useState<RenameState>(null)
  const renameInProgressRef = useRef<boolean>(false)
  const [expandedDirs, setExpandedDirs] = useState<Readonly<Set<string>>>(
    new Set(),
  )

  const getTargetDirectory = () => {
    if (!selectedPath) return ""

    if (selectedPath.endsWith("/")) {
      return selectedPath.substring(0, selectedPath.length - 1)
    } else {
      // It's a file path, get the parent directory
      return selectedPath.substring(0, selectedPath.lastIndexOf("/"))
    }
  }

  // Helper to ensure all parent directories are expanded
  const expandParentDirectories = (path: string) => {
    const newExpandedDirs = new Set(expandedDirs)

    // Get all parent directories
    let currentPath = path
    while (currentPath.includes("/")) {
      currentPath = currentPath.substring(0, currentPath.lastIndexOf("/"))
      if (currentPath) {
        const dirPath = `${currentPath}/`
        newExpandedDirs.add(dirPath)
      }
    }

    setExpandedDirs(newExpandedDirs)
  }

  const handleNewFile = async () => {
    // Determine the directory to create the file in
    const targetDir = getTargetDirectory()

    // Create a unique temporary file name
    const baseFileName = "new-file.thy"
    const uniqueName = await generateUniqueName(
      props.fs,
      targetDir,
      baseFileName,
      false,
    )
    const newPath = `${targetDir}/${uniqueName}`

    // Ensure parent directories are expanded
    expandParentDirectories(newPath)

    // Create the file
    await props.fs.write(newPath, "")

    // Select the new file and start renaming
    setSelectedPath(newPath)
    props.onSelect(newPath)
    renameInProgressRef.current = true
    setRenameState({
      path: newPath,
      isNew: true,
      name: uniqueName,
    })
  }

  const handleNewFolder = async () => {
    // Determine the directory to create the folder in
    const targetDir = getTargetDirectory()

    // Create a unique temporary folder name
    const baseFolderName = "new-folder"
    const uniqueName = await generateUniqueName(
      props.fs,
      targetDir,
      baseFolderName,
      true,
    )
    const newPath = `${targetDir}/${uniqueName}/`

    // Ensure parent directories are expanded
    expandParentDirectories(newPath)

    // Create the folder
    await props.fs.mkdir(newPath)

    // Select the new folder and start renaming
    setSelectedPath(newPath)
    renameInProgressRef.current = true
    setRenameState({
      path: newPath,
      isNew: true,
      name: uniqueName,
    })
  }

  return (
    <div onClick={() => setSelectedPath(null)}>
      <div style="display:flex; justify-content:flex-end;">
        <FontAwesomeIcon
          className={actionStyle}
          title="New File..."
          icon={faFileCirclePlus}
          fixedWidth
          onClick={handleNewFile}
        />
        <FontAwesomeIcon
          className={actionStyle}
          title="New Folder..."
          icon={faFolderPlus}
          fixedWidth
          onClick={handleNewFolder}
        />
      </div>
      <FileTreeNodeList
        {...props}
        selectedPath={selectedPath}
        setSelectedPath={setSelectedPath}
        renameState={renameState}
        setRenameState={setRenameState}
        renameInProgressRef={renameInProgressRef}
        expandedDirs={expandedDirs}
        setExpandedDirs={setExpandedDirs}
      />
    </div>
  )
}

export const FileTreeNodeList = (props: FileTreeProps & SharedChildProps) => {
  const [nodes, setNodes] = useState<readonly FileEntry[]>([])
  const alerts = useAlerts()
  function refreshNodes() {
    props.fs.list(props.directory).then(setNodes, (e) => {
      alerts.showToast(
        `Failed to list files for ${props.directory}:` + stringifyError(e),
      )
    })
  }
  useEffect(refreshNodes, [props.fs, props.directory])
  useSetIntervalWhenActive(refreshNodes, 1000, [props.fs, props.directory])

  // Refresh immediately when rename state changes
  useEffect(() => {
    if (!props.renameState) {
      refreshNodes()
    }
  }, [props.renameState])

  return <FileTreeNodeListSync {...props} nodes={nodes} />
}

type FileTreeNodeListSyncProps = SharedChildProps & {
  directory: string
  nodes: readonly FileEntry[]
}

const FileTreeNodeListSync = ({
  directory,
  nodes,
  ...restProps
}: FileTreeNodeListSyncProps) => {
  const sortedNodes = useMemo(
    () =>
      [...nodes].sort((a, b) => {
        if (a.kind === b.kind) {
          return a.name.localeCompare(b.name)
        }
        if (a.kind === "directory") {
          return -1
        }
        return 1
      }),
    [nodes],
  )

  return (
    <>
      {sortedNodes.map((child) => (
        <FileTreeNode {...restProps} node={child} />
      ))}
    </>
  )
}

export type FileTreeNodeProps = SharedChildProps & {
  node: FileEntry
}

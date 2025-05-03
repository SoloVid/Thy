import {
  faCheck,
  faFile,
  faFileCirclePlus,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faTrash,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useSetIntervalWhenActive } from "editor/hook/use-set-interval-when-active"
import { MutableRef, useEffect, useMemo, useRef, useState } from "preact/hooks"
import { css } from "../component/css"
import { FileEntry, FilesApi } from "./files-api"

type RenameState = {
  path: string
  isNew: boolean
  name: string
} | null

type SharedProps = {
  fs: FilesApi
  onSelect: (newPath: string) => void
  onDelete: (path: string) => void
  // TODO: Implement rename
  // onRename: (oldPath: string, newPath: string) => void
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

// Helper function to generate a unique name
const generateUniqueName = async (
  fs: FilesApi,
  directory: string,
  baseName: string,
  isDirectory: boolean,
): Promise<string> => {
  // For directories, we need to handle the trailing slash in the check
  const checkPath = (name: string) => {
    const path = `${directory}/${name}${isDirectory ? "/" : ""}`
    return fs.exists(path)
  }

  // If the base name already has a number suffix, extract it
  const match = baseName.match(/^(.+?)(?:[ _-](\d+))?(\.\w+)?$/)
  if (!match) return baseName

  const [, nameWithoutNumber, existingNumber, extension] = match
  const ext = extension || ""
  const nameBase = nameWithoutNumber || baseName

  // Check if the base name exists
  if (!(await checkPath(baseName))) {
    return baseName
  }

  // Start with 1 or increment the existing number
  let counter = existingNumber ? parseInt(existingNumber, 10) + 1 : 1
  let newName = `${nameBase}${counter}${ext}`

  // Keep incrementing until we find a name that doesn't exist
  while (await checkPath(newName)) {
    newName = `${nameBase}${counter}${ext}`
    counter++
  }

  return newName
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

const FileTreeNodeList = (props: FileTreeProps & SharedChildProps) => {
  const [nodes, setNodes] = useState<readonly FileEntry[]>([])
  function refreshNodes() {
    props.fs.list(props.directory).then(setNodes, (e) => {
      // TODO: Surface error.
      console.error(e)
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

type FileTreeNodeProps = SharedChildProps & {
  node: FileEntry
}

// Inline rename component
const InlineRename = ({
  initialName,
  onSave,
  onCancel,
}: {
  initialName: string
  onSave: (newName: string) => void
  onCancel: () => void
}) => {
  const [name, setName] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input and select the name without extension
    if (inputRef.current) {
      inputRef.current.focus()

      // Select name without extension
      const dotIndex = initialName.lastIndexOf(".")
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex)
      } else {
        inputRef.current.select()
      }
    }
  }, [initialName])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSave(name)
    } else if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div class={renameContainerStyles}>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onInput={(e) => setName((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        onfocusout={() => onSave(name)}
        class={renameInputStyles}
      />
      <div class={renameActionsStyles}>
        <FontAwesomeIcon
          icon={faCheck}
          className={renameActionStyle}
          onClick={() => onSave(name)}
          title="Save"
          fixedWidth
        />
        <FontAwesomeIcon
          icon={faXmark}
          className={renameActionStyle}
          onClick={onCancel}
          title="Cancel"
          fixedWidth
        />
      </div>
    </div>
  )
}

const FileTreeNode = ({ fs, node, ...restProps }: FileTreeNodeProps) => {
  const [isHovering, setIsHovering] = useState(false)

  const isRenaming =
    restProps.renameState && restProps.renameState.path === node.path

  // Check if this directory is expanded
  const isExpanded =
    node.kind === "directory" && restProps.expandedDirs.has(node.path)

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    restProps.setSelectedPath(node.path)
    restProps.onSelect(node.path)
    if (node.kind === "directory") {
      const newExpandedDirs = new Set(restProps.expandedDirs)
      if (isExpanded) {
        newExpandedDirs.delete(node.path)
      } else {
        newExpandedDirs.add(node.path)
      }
      restProps.setExpandedDirs(newExpandedDirs)
    }
  }

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete ${node.name}?`)) {
      fs.delete(node.path).then(
        () => {
          restProps.onDelete(node.path)
        },
        (e) => {
          // TODO: Surface error.
          console.error(e)
        },
      )
    }
  }

  const handleStartRename = (e: MouseEvent) => {
    e.stopPropagation()
    restProps.renameInProgressRef.current = true
    restProps.setRenameState({
      path: node.path,
      isNew: false,
      name: node.name,
    })
  }

  const handleSaveRename = async (newName: string) => {
    if (!restProps.renameState || !restProps.renameInProgressRef.current) return
    restProps.renameInProgressRef.current = false

    const oldPath = restProps.renameState.path
    // For directories, we need to handle the trailing slash
    const oldPathNoTrailingSlash = oldPath.replace(/\/$/, "")
    const dirPath = oldPathNoTrailingSlash.substring(
      0,
      oldPathNoTrailingSlash.lastIndexOf("/"),
    )
    const isDirectory = node.kind === "directory"

    // Generate a unique name if the requested name already exists
    // (but only if it's different from the current name)
    let finalName = newName
    if (newName !== node.name) {
      const uniqueName = await generateUniqueName(
        fs,
        dirPath,
        newName,
        isDirectory,
      )
      finalName = uniqueName
    }

    // For directories, ensure the new path ends with a slash
    const newPath = isDirectory
      ? `${dirPath}/${finalName}/`
      : `${dirPath}/${finalName}`

    // Clear rename state
    restProps.setRenameState(null)

    try {
      await fs.rename(oldPath, newPath)

      // Update selection to the new path
      restProps.setSelectedPath(newPath)
      restProps.onSelect(newPath)
    } catch (e) {
      console.error(`Failed to rename ${isDirectory ? "folder" : "file"}:`, e)
      alert(`Failed to rename ${isDirectory ? "folder" : "file"}: ${e}`)
    }
  }

  const handleCancelRename = () => {
    restProps.renameInProgressRef.current = false
    // If this was a new item and rename was canceled, delete it
    if (restProps.renameState?.isNew) {
      fs.delete(node.path).catch((e) =>
        console.error(`Failed to delete new ${node.kind}:`, e),
      )
    }
    restProps.setRenameState(null)
  }

  const icon = useMemo(
    () => (
      <FontAwesomeIcon
        icon={
          node.kind === "directory"
            ? isExpanded
              ? faFolderOpen
              : faFolder
            : faFile
        }
        fixedWidth
      />
    ),
    [node.kind, isExpanded],
  )

  const childrenContainer = useMemo(
    () =>
      isExpanded && (
        <div class={childrenStyles}>
          <FileTreeNodeList fs={fs} directory={node.path} {...restProps} />
        </div>
      ),
    [fs, isExpanded, node.path, restProps],
  )

  return (
    <div class={nodeStyles}>
      <div
        class={`${nodeHeaderContainerStyles} ${restProps.selectedPath === node.path ? nodeHeaderContainerSelectedStyles : ""}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isRenaming ? (
          <div class={nodeHeaderStyles}>
            {icon}
            <InlineRename
              initialName={restProps.renameState.name}
              onSave={handleSaveRename}
              onCancel={handleCancelRename}
            />
          </div>
        ) : (
          <>
            <div class={nodeHeaderStyles} onClick={handleClick}>
              {icon}
              <span class={nodeTextStyles}>{node.name}</span>
            </div>
            {isHovering && (
              <div class={entryActionContainerStyles}>
                <FontAwesomeIcon
                  className={actionStyle}
                  title="Rename"
                  icon={faWandMagicSparkles}
                  fixedWidth
                  onClick={handleStartRename}
                />
                <FontAwesomeIcon
                  className={actionStyle}
                  title="Delete"
                  icon={faTrash}
                  fixedWidth
                  onClick={handleDelete}
                />
              </div>
            )}
          </>
        )}
      </div>
      {childrenContainer}
    </div>
  )
}

const actionStyle = css`
  cursor: pointer;
  padding: 4px;

  &:hover {
    background-color: rgba(150, 150, 150, 0.3);
  }
`

const nodeStyles = css``

const nodeHeaderContainerStyles = css`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: rgba(150, 150, 150, 0.3);
  }
`
const nodeHeaderContainerSelectedStyles = css`
  background-color: rgba(150, 150, 150, 0.5);
  &:hover {
    /* Poor man's override of non-selected hover style */
    background-color: rgba(150, 150, 150, 0.5);
  }
`

const nodeHeaderStyles = css`
  flex-grow: 1;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
`

const nodeTextStyles = css`
  margin-left: 4px;
`

const childrenStyles = css`
  margin-left: 16px;
`

const entryActionContainerStyles = css`
  display: flex;
`

const renameContainerStyles = css`
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-left: 4px;
`

const renameInputStyles = css`
  flex-grow: 1;
  background-color: #3c3c3c;
  color: #ddd;
  border: 1px solid #555;
  border-radius: 2px;
  padding: 2px 4px;
  font-size: 14px;
  outline: none;
`

const renameActionsStyles = css`
  display: flex;
  margin-left: 4px;
`

const renameActionStyle = css`
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    background-color: rgba(150, 150, 150, 0.3);
  }
`

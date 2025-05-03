import {
  faCheck,
  faFile,
  faFileCirclePlus,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faPencil,
  faTrash,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { JSX, useEffect, useMemo, useRef, useState } from "preact/hooks"
import { css } from "../component/css"
import { FileEntry, FilesApi } from "./files-api"
import { useSetIntervalWhenActive } from "editor/hook/use-set-interval-when-active"
import { makeInMemoryFiles } from "./in-memory-files"
import { join } from "path-browserify"

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
  setSelectedPath: (newPath: string) => void
  renameState: RenameState
  setRenameState: (state: RenameState) => void
}

type FileTreeProps = SharedProps & {
  directory: string
}

// FileTree component
export const FileTree = (props: FileTreeProps) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [renameState, setRenameState] = useState<RenameState>(null)

  const handleNewFile = async () => {
    // Determine the directory to create the file in
    let targetDir = props.directory
    if (selectedPath) {
      const entry = await props.fs.list(selectedPath).then(
        entries => entries[0],
        () => null
      )
      if (entry) {
        targetDir = entry.kind === "directory" ? selectedPath : selectedPath.substring(0, selectedPath.lastIndexOf('/'))
      }
    }
    
    // Create a temporary file name
    const tempName = "new-file.thy"
    const newPath = join(targetDir, tempName)
    
    // Create the file
    await props.fs.write(newPath, "")
    
    // Select the new file and start renaming
    setSelectedPath(newPath)
    props.onSelect(newPath)
    setRenameState({
      path: newPath,
      isNew: true,
      name: tempName
    })
  }

  return (
    <div>
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
        />
      </div>
      <FileTreeNodeList
        {...props}
        selectedPath={selectedPath}
        setSelectedPath={setSelectedPath}
        renameState={renameState}
        setRenameState={setRenameState}
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
      const dotIndex = initialName.lastIndexOf('.')
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex)
      } else {
        inputRef.current.select()
      }
    }
  }, [initialName])
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSave(name)
    } else if (e.key === 'Escape') {
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  const isRenaming = restProps.renameState && restProps.renameState.path === node.path
  
  const handleClick = (e: MouseEvent) => {
    restProps.setSelectedPath(node.path)
    restProps.onSelect(node.path)
    if (node.kind === "directory") {
      setIsExpanded(!isExpanded)
    }
  }

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete ${node.name}?`)) {
      restProps.onDelete(node.path)
    }
  }
  
  const handleStartRename = (e: MouseEvent) => {
    e.stopPropagation()
    restProps.setRenameState({
      path: node.path,
      isNew: false,
      name: node.name
    })
  }
  
  const handleSaveRename = async (newName: string) => {
    if (!restProps.renameState) return
    
    const oldPath = restProps.renameState.path
    const dirPath = oldPath.substring(0, oldPath.lastIndexOf('/'))
    const newPath = join(dirPath, newName)
    
    try {
      // If it's a new file, we don't need to rename, just update the path
      if (restProps.renameState.isNew) {
        // Read the content of the old file
        const content = await fs.read(oldPath)
        // Write to the new path
        await fs.write(newPath, content)
        // Delete the old file
        await fs.delete(oldPath)
      } else {
        // For existing files, use the rename API
        await fs.rename(oldPath, newPath)
      }
      
      // Update selection to the new path
      restProps.setSelectedPath(newPath)
      restProps.onSelect(newPath)
    } catch (e) {
      console.error("Failed to rename file:", e)
      alert(`Failed to rename file: ${e}`)
    }
    
    // Clear rename state
    restProps.setRenameState(null)
  }
  
  const handleCancelRename = () => {
    // If this was a new file and rename was canceled, delete it
    if (restProps.renameState?.isNew) {
      fs.delete(node.path).catch(e => console.error("Failed to delete new file:", e))
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

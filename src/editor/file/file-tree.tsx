import {
  faFile,
  faFileCirclePlus,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faPencil,
  faTrash,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useMemo, useState } from "preact/hooks"
import { css } from "../component/css"
import { FileEntry, FilesApi } from "./files-api"
import { useSetIntervalWhenActive } from "editor/hook/use-set-interval-when-active"
import { makeInMemoryFiles } from "./in-memory-files"

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
}

type FileTreeProps = SharedProps & {
  directory: string
}

// FileTree component
export const FileTree = (props: FileTreeProps) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  return (
    <div>
      <div style="display:flex; justify-content:flex-end;">
        <FontAwesomeIcon
        className={actionStyle}
        title="New File..."
        icon={
          faFileCirclePlus
        }
        fixedWidth
      />
        <FontAwesomeIcon
        className={actionStyle}
        title="New Folder..."
        icon={
          faFolderPlus
        }
        fixedWidth
      />

      </div>
      <FileTreeNodeList {...props} selectedPath={selectedPath} setSelectedPath={setSelectedPath} />
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
  return <FileTreeNodeListSync {...props} nodes={nodes} />
}

type FileTreeNodeListSyncProps = SharedChildProps & {
  directory: string
  nodes: readonly FileEntry[]
}

const FileTreeNodeListSync = ({ directory, nodes, ...restProps }: FileTreeNodeListSyncProps) => {
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

const FileTreeNode = ({ fs, node, ...restProps }: FileTreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const handleClick = (e: MouseEvent) => {
    restProps.setSelectedPath(node.path)
    restProps.onSelect(node.path)
    if (node.kind === "directory") {
      setIsExpanded(!isExpanded)
    }
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
      isExpanded &&
       (
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
      <div
        class={nodeHeaderStyles}
        onClick={handleClick}
      >
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
            />
            <FontAwesomeIcon
              className={actionStyle}
              title="Delete"
              icon={faTrash}
              fixedWidth
            />
          </div>
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

// Example usage
const exampleFs = makeInMemoryFiles(() => new Date().getTime())
async function configureExampleFs() {
  await exampleFs.mkdir("/test-subdir")
  await exampleFs.write("/test-subdir/a.thy", "print \"a\"")
  await exampleFs.write("/test-subdir/b.thy", "print \"b\"")
  await exampleFs.write("/main.thy", "print \"himom\"")
}
configureExampleFs()

export const ExampleFileTree = () => <FileTree fs={exampleFs} directory="/" />

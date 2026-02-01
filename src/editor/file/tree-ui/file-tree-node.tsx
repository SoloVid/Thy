import {
  faFile,
  faFolder,
  faFolderOpen,
  faTrash,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAlerts } from "editor/alert-provider.tsx"
import { useMemo, useState } from "preact/hooks"
import { stringifyError } from "utils/stringify-error.ts"
import { css } from "../../component/css.ts"
import { FileTreeNodeList, FileTreeNodeProps } from "./file-tree.tsx"
import { generateUniqueName } from "../generate-unique-name.ts"
import { InlineRename } from "./rename.tsx"
import { actionStyle } from "./shared-style.ts"

export const FileTreeNode = ({ fs, node, ...restProps }: FileTreeNodeProps) => {
  const [isHovering, setIsHovering] = useState(false)

  const alerts = useAlerts()

  // Check if this directory is expanded
  const isExpanded = node.kind === "directory" &&
    restProps.expandedDirs.has(node.path)

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
    alerts.confirm(`Delete ${node.name}?`).then(
      async (confirmed) => {
        if (confirmed) {
          await fs.delete(node.path)
          restProps.onDelete(node.path)
        }
      },
      (e) => {
        alerts.showAlert(`Failed to delete ${node.path}:` + stringifyError(e))
      },
    )
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
      alerts.showAlert(
        `Failed to rename ${isDirectory ? "folder" : "file"}:` +
          stringifyError(e),
      )
    }
  }

  const handleCancelRename = () => {
    restProps.renameInProgressRef.current = false
    // If this was a new item and rename was canceled, delete it
    if (restProps.renameState?.isNew) {
      fs.delete(node.path).then(
        () => {
          // Do nothing.
        },
        (e) =>
          alerts.showAlert(
            `Failed to delete new ${node.kind}:` + stringifyError(e),
          ),
      )
    }
    restProps.setRenameState(null)
  }

  const icon = useMemo(
    () => (
      <FontAwesomeIcon
        icon={node.kind === "directory"
          ? isExpanded ? faFolderOpen : faFolder
          : faFile}
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
        class={`${nodeHeaderContainerStyles} ${
          restProps.selectedPath === node.path
            ? nodeHeaderContainerSelectedStyles
            : ""
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {restProps.renameState && restProps.renameState.path === node.path
          ? (
            <div class={nodeHeaderStyles}>
              {icon}
              <InlineRename
                initialName={restProps.renameState.name}
                onSave={handleSaveRename}
                onCancel={handleCancelRename}
              />
            </div>
          )
          : (
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

const nodeStyles = css`
`

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

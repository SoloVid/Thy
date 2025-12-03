import {
  faFolder,
  faFolderOpen,
  faFloppyDisk,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAlerts } from "../alert-provider"
import { useEffect, useState } from "preact/hooks"
import { SerializedWorkspace } from "./serialized-workspace"
import { FilesApi } from "./files-api"
import { generateUID } from "../../utils/uid"
import { actionStyle } from "./tree-ui/shared-style"

type WorkspaceBrowserProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string, workspace: SerializedWorkspace) => void
  mode: "load" | "save"
  currentPath?: string
  getCurrentWorkspace?: () => SerializedWorkspace
  indexedDbFs: FilesApi
}

type WorkspaceEntry = {
  path: string
  name: string
  isDirectory: boolean
}

export function WorkspaceBrowser({
  isOpen,
  onClose,
  onSelect,
  mode,
  currentPath,
  getCurrentWorkspace,
  indexedDbFs,
}: WorkspaceBrowserProps) {
  const [currentDirectory, setCurrentDirectory] = useState<string>("/")
  const [entries, setEntries] = useState<WorkspaceEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("")
  const alerts = useAlerts()

  // Reset state when the browser is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentDirectory("/")
      setSelectedEntry(currentPath || null)
      setNewWorkspaceName(
        currentPath ? currentPath.split("/").pop() || "workspace" : "workspace",
      )
      loadEntries("/")
    }
  }, [isOpen, currentPath])

  const loadEntries = async (directory: string) => {
    try {
      const list = await indexedDbFs.list(directory)
      const dirPath = directory.endsWith("/") ? directory : `${directory}/`
      const mappedEntries: WorkspaceEntry[] = list.map((entry) => ({
        path:
          directory === "/"
            ? `/${entry.name}${entry.kind === "directory" ? "/" : ""}`
            : `${dirPath}${entry.name}${entry.kind === "directory" ? "/" : ""}`,
        name: entry.name,
        isDirectory: entry.kind === "directory",
      }))

      // Sort directories first, then by name
      mappedEntries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })

      setEntries(mappedEntries)
    } catch (error) {
      alerts.showAlert(`Failed to list workspaces: ${error}`)
    }
  }

  const handleEntryClick = async (entry: WorkspaceEntry) => {
    if (entry.isDirectory) {
      setCurrentDirectory(entry.path)
      loadEntries(entry.path)
    } else {
      setSelectedEntry(entry.path)
      if (mode === "save") {
        // Extract filename without extension for editing
        const filename = entry.name.endsWith(".json")
          ? entry.name.substring(0, entry.name.length - 5)
          : entry.name
        setNewWorkspaceName(filename)
      }
    }
  }

  const handleDoubleClick = async (entry: WorkspaceEntry) => {
    if (entry.isDirectory) {
      setCurrentDirectory(entry.path)
      loadEntries(entry.path)
    } else if (mode === "load") {
      try {
        const content = await indexedDbFs.read(entry.path)
        const workspace = JSON.parse(content) as SerializedWorkspace
        onSelect(entry.path, workspace)
      } catch (error) {
        alerts.showAlert(`Failed to load workspace: ${error}`)
      }
    }
  }

  const handleSave = async () => {
    if (!getCurrentWorkspace) {
      alerts.showAlert("No workspace to save")
      return
    }

    if (!newWorkspaceName) {
      alerts.showAlert("Please enter a workspace name")
      return
    }

    // Determine the save path
    let savePath: string
    if (
      selectedEntry &&
      !entries.find((e) => e.path === selectedEntry)?.isDirectory
    ) {
      // If an entry is selected but we're using a new name, create a new file
      const selectedDir = selectedEntry.substring(
        0,
        selectedEntry.lastIndexOf("/") + 1,
      )
      if (newWorkspaceName !== selectedEntry.split("/").pop()) {
        savePath = `${selectedDir}${newWorkspaceName}`
      } else {
        // Use the selected entry path if name hasn't changed
        savePath = selectedEntry
      }
    } else {
      // Create a new file in the current directory
      const dirPath = currentDirectory.endsWith("/")
        ? currentDirectory
        : `${currentDirectory}/`
      savePath =
        dirPath === "/"
          ? `/${newWorkspaceName}`
          : `${dirPath}${newWorkspaceName}`
    }

    // Ensure .json extension
    if (!savePath.endsWith(".json")) {
      savePath += ".json"
    }

    try {
      // Check if file exists
      const exists = await indexedDbFs.exists(savePath)
      if (exists) {
        const confirmed = await alerts.confirm(
          `Workspace "${savePath}" already exists. Overwrite?`,
        )
        if (!confirmed) return
      }

      // Save the workspace
      const currentWorkspace = getCurrentWorkspace()
      await indexedDbFs.write(
        savePath,
        JSON.stringify(currentWorkspace, null, 2),
      )
      alerts.showToast(`Workspace saved to ${savePath}`, "success")
      onSelect(savePath, currentWorkspace)
    } catch (error) {
      alerts.showAlert(`Failed to save workspace: ${error}`)
    }
  }

  const handleLoad = async () => {
    if (!selectedEntry) {
      alerts.showAlert("Please select a workspace to load")
      return
    }

    try {
      const content = await indexedDbFs.read(selectedEntry)
      const workspace = JSON.parse(content) as SerializedWorkspace
      onSelect(selectedEntry, workspace)
    } catch (error) {
      alerts.showAlert(`Failed to load workspace: ${error}`)
    }
  }

  const handleCreateFolder = async () => {
    const folderName = await alerts.prompt("Enter folder name:")
    if (!folderName) return

    const dirPath = currentDirectory.endsWith("/")
      ? currentDirectory
      : `${currentDirectory}/`
    const folderPath =
      currentDirectory === "/" ? `/${folderName}/` : `${dirPath}${folderName}/`

    try {
      await indexedDbFs.mkdir(folderPath)
      loadEntries(currentDirectory)
    } catch (error) {
      alerts.showAlert(`Failed to create folder: ${error}`)
    }
  }

  // Handle navigation to parent directory
  const navigateUp = () => {
    if (currentDirectory === "/") return

    const parentDir = currentDirectory.substring(
      0,
      currentDirectory.lastIndexOf("/", currentDirectory.length - 2) + 1,
    )

    setCurrentDirectory(parentDir || "/")
    loadEntries(parentDir || "/")
  }

  if (!isOpen) return null

  return (
    <div
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; align-items: center;"
      onClick={(e) => {
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style="background-color: #272822; color: #ddd; width: 80%; max-width: 600px; height: 80%; max-height: 500px; border-radius: 5px; overflow: hidden; display: flex; flex-direction: column;"
        onClick={(e) => e.stopPropagation()}
      >
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #444;">
          <h3 style="margin: 0;">
            {mode === "load" ? "Load Workspace" : "Save Workspace"}
          </h3>
          <FontAwesomeIcon
            icon={faTimes}
            onClick={onClose}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div style="padding: 10px; border-bottom: 1px solid #444; display: flex; align-items: center;">
          <button
            onClick={navigateUp}
            disabled={currentDirectory === "/"}
            style="background-color: #444; color: #ddd; border: none; padding: 5px 10px; margin-right: 10px; cursor: pointer;"
          >
            Up
          </button>
          <span style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {currentDirectory}
          </span>
          <button
            onClick={handleCreateFolder}
            style="background-color: #444; color: #ddd; border: none; padding: 5px 10px; margin-left: 10px; cursor: pointer;"
          >
            New Folder
          </button>
        </div>

        <div style="flex-grow: 1; overflow-y: auto; padding: 10px;">
          {entries.length === 0 ? (
            <div style="text-align: center; padding: 20px;">
              No workspaces found in this directory
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.path}
                style={`display: flex; align-items: center; padding: 5px; cursor: pointer; ${
                  selectedEntry === entry.path
                    ? "background-color: #444;"
                    : "hover:background-color: #333;"
                }`}
                onClick={() => handleEntryClick(entry)}
                onDblClick={() => handleDoubleClick(entry)}
              >
                <FontAwesomeIcon
                  icon={entry.isDirectory ? faFolderOpen : faFloppyDisk}
                  style={{ "margin-right": "10px" }}
                />
                <span style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {entry.name}
                </span>
              </div>
            ))
          )}
        </div>

        {mode === "save" && (
          <div style="padding: 10px; border-top: 1px solid #444; display: flex; align-items: center;">
            <span style="margin-right: 10px;">Name:</span>
            <input
              type="text"
              value={newWorkspaceName}
              onInput={(e) => setNewWorkspaceName(e.currentTarget.value)}
              style="flex-grow: 1; background-color: #333; color: #ddd; border: 1px solid #555; padding: 5px;"
            />
          </div>
        )}

        <div style="padding: 10px; border-top: 1px solid #444; display: flex; justify-content: flex-end;">
          <button
            onClick={onClose}
            style="background-color: #444; color: #ddd; border: none; padding: 8px 15px; margin-right: 10px; cursor: pointer;"
          >
            Cancel
          </button>
          <button
            onClick={mode === "load" ? handleLoad : handleSave}
            style="background-color: #f80; color: #fff; border: none; padding: 8px 15px; cursor: pointer;"
          >
            {mode === "load" ? "Load" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

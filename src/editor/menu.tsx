import {
  faBars,
  faFloppyDisk,
  faFolderOpen,
  faGear,
  faPlay,
  faShareFromSquare,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CopyToClipboardButton } from "../home/button"
import { useAlerts } from "./alert-provider"
import { InMemoryFiles } from "./file/in-memory-files"
import { makeFileManager, useLocalFiles } from "./file/local-files"
import { makeShareUrl } from "./source-code/share-url"
import { EditorState } from "./state"
import { useState } from "preact/hooks"
import { WorkspaceBrowser } from "./file/workspace-browser"
import { makeIndexedDbFiles } from "./file/indexed-db-files"
import { SerializedWorkspace } from "./file/serialized-workspace"

type MenuProps = {
  fs: InMemoryFiles
  state: EditorState
  toggleLeftPanel: () => void
}

export default function Menu({ fs, state, toggleLeftPanel }: MenuProps) {
  const rawFileManager = makeFileManager()
  const fileMan = useLocalFiles(rawFileManager)
  const alerts = useAlerts()
  const [workspaceBrowserOpen, setWorkspaceBrowserOpen] = useState(false)
  const [workspaceBrowserMode, setWorkspaceBrowserMode] = useState<"load" | "save">("load")
  const [currentWorkspacePath, setCurrentWorkspacePath] = useState<string | undefined>(undefined)
  const [indexedDbFs] = useState(() => makeIndexedDbFiles())

  const handleSaveWorkspace = () => {
    setWorkspaceBrowserMode("save")
    setWorkspaceBrowserOpen(true)
  }

  const handleLoadWorkspace = () => {
    setWorkspaceBrowserMode("load")
    setWorkspaceBrowserOpen(true)
  }

  const handleWorkspaceSelected = async (path: string, workspace: SerializedWorkspace) => {
    setWorkspaceBrowserOpen(false)
    setCurrentWorkspacePath(path)

    if (workspaceBrowserMode === "load") {
      try {
        // Ingest the workspace
        fs.ingest(workspace)
        
        // If there's a main.thy file, open it by default
        if (await fs.exists("/main.thy")) {
          const contents = await fs.read("/main.thy")
          state.setSourceCode({
            path: "/main.thy",
            contents,
            language: "thy",
          })
        } else {
          // Otherwise, try to find any .thy file to open
          const entries = await fs.list("/")
          const thyFile = entries.find(entry => 
            entry.kind === "file" && entry.name.endsWith(".thy")
          )
          
          if (thyFile) {
            const contents = await fs.read(`/${thyFile.name}`)
            state.setSourceCode({
              path: `/${thyFile.name}`,
              contents,
              language: "thy",
            })
          } else {
            // Clear the editor if no .thy files found
            state.setSourceCode({
              path: "",
              contents: "",
              language: "thy",
            })
          }
        }
        
        alerts.showToast(`Loaded workspace from ${path}`, "success")
      } catch (error) {
        alerts.showAlert(`Failed to load workspace: ${error}`)
      }
    } else {
      alerts.showToast(`Saved workspace to ${path}`, "success")
    }
  }

  return (
    <div>
      <div className="button-panel">
        <a
          onClick={toggleLeftPanel}
          className="button"
          title="Show files"
        >
          <FontAwesomeIcon icon={faBars} />
        </a>
        <a
          onClick={handleSaveWorkspace}
          className="button"
          title="Save"
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
        </a>
        <a
          onClick={handleLoadWorkspace}
          className="button"
          title="Load"
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </a>
        <a
          onClick={() => {
            // TODO: Implement options popup, probably integrated with alerts system.
          }}
          className="button"
          title="Options"
        >
          <FontAwesomeIcon icon={faGear} />
        </a>
        <a
          onClick={() => {
            // TODO: Run interpreter on entire workspace rather than just the one file.
            // Note that this will require integrating the "thy" function
            // which is partially implemented today in thy-from-blocks.ts
            state.runThenSetOutput(state.sourceCode.contents)
          }}
          className="button"
          style={{ backgroundColor: "orange" }}
          title="Run"
        >
          <FontAwesomeIcon icon={faPlay} />
        </a>
        <CopyToClipboardButton
          getValue={() => makeShareUrl(fs.serialize())}
          tooltip="Copied URL"
          title="Share"
        >
          <FontAwesomeIcon icon={faShareFromSquare} />
        </CopyToClipboardButton>
      </div>

      <WorkspaceBrowser
        isOpen={workspaceBrowserOpen}
        onClose={() => setWorkspaceBrowserOpen(false)}
        onSelect={handleWorkspaceSelected}
        mode={workspaceBrowserMode}
        currentPath={currentWorkspacePath}
        currentWorkspace={fs.serialize()}
        indexedDbFs={indexedDbFs}
      />
    </div>
  )
}

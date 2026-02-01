import {
  faBars,
  faFloppyDisk,
  faFolderOpen,
  faGear,
  faPlay,
  faShareFromSquare,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "preact/hooks"
import { CopyToClipboardButton } from "../website/static/button.tsx"
import { useAlerts } from "./alert-provider.tsx"
import { InMemoryFiles } from "./file/in-memory-files.ts"
import { makeIndexedDbFiles } from "./file/indexed-db-files.ts"
import { makeFileManager, useLocalFiles } from "./file/local-files.ts"
import { SerializedWorkspace } from "./file/serialized-workspace.ts"
import { WorkspaceBrowser } from "./file/workspace-browser.tsx"
import { SourceCodeManager } from "./source-code/manager.ts"
import { serialize } from "./source-code/serialize.ts"
import { makeShareUrl } from "./source-code/share-url.ts"

type MenuProps = {
  fs: InMemoryFiles
  scm: SourceCodeManager
  toggleLeftPanel: () => void
}

export default function Menu({ fs, scm, toggleLeftPanel }: MenuProps) {
  const rawFileManager = makeFileManager()
  const fileMan = useLocalFiles(rawFileManager)
  const alerts = useAlerts()
  const [workspaceBrowserOpen, setWorkspaceBrowserOpen] = useState(false)
  const [workspaceBrowserMode, setWorkspaceBrowserMode] = useState<
    "load" | "save"
  >("load")
  const [currentWorkspacePath, setCurrentWorkspacePath] = useState<
    string | undefined
  >(undefined)
  const [indexedDbFs] = useState(() => makeIndexedDbFiles("workspaces"))

  const handleSaveWorkspace = () => {
    setWorkspaceBrowserMode("save")
    setWorkspaceBrowserOpen(true)
  }

  const handleLoadWorkspace = () => {
    setWorkspaceBrowserMode("load")
    setWorkspaceBrowserOpen(true)
  }

  const handleWorkspaceSelected = async (
    path: string,
    workspace: SerializedWorkspace,
  ) => {
    setWorkspaceBrowserOpen(false)
    setCurrentWorkspacePath(path)

    if (workspaceBrowserMode === "load") {
      try {
        await scm.loadWorkspace(workspace)
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
        <a onClick={toggleLeftPanel} className="button" title="Show files">
          <FontAwesomeIcon icon={faBars} />
        </a>
        <a onClick={handleSaveWorkspace} className="button" title="Save">
          <FontAwesomeIcon icon={faFloppyDisk} />
        </a>
        <a onClick={handleLoadWorkspace} className="button" title="Load">
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
          onClick={() => alerts.catch(scm.run())}
          className="button"
          style={scm.isOutputStale ? { backgroundColor: "orange" } : {}}
          title="Run"
        >
          <FontAwesomeIcon icon={faPlay} />
        </a>
        <CopyToClipboardButton
          getValue={() => makeShareUrl(serialize(fs, scm))}
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
        getCurrentWorkspace={() => serialize(fs, scm)}
        indexedDbFs={indexedDbFs}
      />
    </div>
  )
}

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

type MenuProps = {
  fs: InMemoryFiles
  state: EditorState
}

export default function Menu({ fs, state }: MenuProps) {
  const rawFileManager = makeFileManager()
  const fileMan = useLocalFiles(rawFileManager)
  const alerts = useAlerts()

  return (
    <div>
      <div className="button-panel">
        <a
          onClick={() => {
            // TODO: Toggle visibility of the workspace file explorer (left panel).
          }}
          className="button"
          title="Show files"
        >
          <FontAwesomeIcon icon={faBars} />
        </a>
        <a
          onClick={() => {
            // TODO: Save entire open workspace to disk.
            // If the workspace has not been saved before,
            // open a (fake) file explorer to select a location.
          }}
          className="button"
          title="Save"
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
        </a>
        <a
          onClick={() => {
            // TODO: Open (fake) file explorer to select a workspace to load.
          }}
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
            state.runThenSetOutput(state.sourceCode)
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
    </div>
  )
}

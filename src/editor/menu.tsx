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
import { CopyToClipboardButton } from "../home/button"
import { FilesApi } from "./file/files-api"
import { makeFileManager, useLocalFiles } from "./file/local-files"
import { makeShareUrl } from "./source-code/share-url"
import { EditorState } from "./state"

type MenuProps = {
  fs: FilesApi
  state: EditorState
}

export default function Menu({ state }: MenuProps) {
  const [menuShowing, setMenuShowing] = useState<"file" | "options" | null>(
    null,
  )

  const rawFileManager = makeFileManager()
  const fileMan = useLocalFiles(rawFileManager)

  return (
    <div>
      <div className="button-panel">
        <a
          onClick={() =>
            setMenuShowing((before) => (before === "file" ? null : "file"))
          }
          className="button"
          title="Show files"
        >
          <FontAwesomeIcon icon={faBars} />
        </a>
        <a
          onClick={() =>
            setMenuShowing((before) => (before === "file" ? null : "file"))
          }
          className="button"
          title="Save"
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
        </a>
        <a
          onClick={() =>
            setMenuShowing((before) => (before === "file" ? null : "file"))
          }
          className="button"
          title="Load"
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </a>
        <a
          onClick={() =>
            setMenuShowing((before) =>
              before === "options" ? null : "options",
            )
          }
          className="button"
          title="Options"
        >
          <FontAwesomeIcon icon={faGear} />
        </a>
        <a
          onClick={() => state.runThenSetOutput(state.sourceCode)}
          className="button"
          style={{ backgroundColor: "orange" }}
          title="Run"
        >
          <FontAwesomeIcon icon={faPlay} />
        </a>
        <CopyToClipboardButton
          getValue={() => makeShareUrl(state.sourceCode)}
          tooltip="Copied URL"
          title="Share"
        >
          <FontAwesomeIcon icon={faShareFromSquare} />
        </CopyToClipboardButton>
      </div>
      {menuShowing === "file" && (
        <>
          <ul>
            {fileMan.files.length === 0 && <li>No saved files</li>}
            {fileMan.files.map((f) => (
              <li>
                <a
                  className="small button"
                  onClick={() => {
                    fileMan.saveFile(f, state.sourceCode, {
                      language: state.editorLanguage,
                    })
                    state.setFileLoaded(f)
                  }}
                >
                  Save
                </a>
                <a
                  className="small button"
                  onClick={() => {
                    const contents = fileMan.getFile(f)
                    if (contents === null) {
                      return
                    }
                    // Push a new state for browser history.
                    history.pushState(history.state, "", "")
                    state.setSourceCode(contents)
                    const metadata = fileMan.getMetadata(f)
                    state.setEditorLanguage(metadata.language ?? "thy")
                    state.setFileLoaded(f)
                  }}
                >
                  Load
                </a>
                <a
                  className="small button"
                  onClick={() => fileMan.deleteFile(f)}
                >
                  Delete
                </a>
                <strong>{f}</strong>
              </li>
            ))}
            <li>
              <a
                className="small button"
                onClick={() => {
                  const newName = fileMan.saveAsNew(state.sourceCode)
                  if (!!newName) {
                    state.setFileLoaded(newName)
                  }
                }}
              >
                Save as New
              </a>
              <a
                className="small button"
                onClick={() => {
                  if (!window.confirm("Clear editor?")) {
                    return
                  }
                  state.setSourceCode("")
                  state.setFileLoaded("")
                }}
              >
                Clear
              </a>
            </li>
          </ul>
          <hr />
        </>
      )}
      {menuShowing === "options" && (
        <>
          <label>
            Language:
            <select
              value={state.editorLanguage}
              onChange={(e) => {
                const newLang = (e.target as HTMLSelectElement).value
                state.setEditorLanguage(newLang)
              }}
            >
              <option value="thy">thy</option>
              <option value="text">text</option>
            </select>
          </label>
          <hr />
        </>
      )}
    </div>
  )
}

import { useEffect, useState } from "preact/hooks"
import { AlertProvider, useAlerts } from "./alert-provider"
import CodeInput from "./code-input"
import { FileTree } from "./file/tree-ui/file-tree"
import Menu from "./menu"
import OutputContainer from "./output-container"
import { useEditorPreferences } from "./preferences"
import Resizer from "./resizer"
import { useEditorState } from "./state"

function PlaygroundContent() {
  useEffect(() => {
    document.title = "Thy Playground"
  }, [])
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  useEffect(() => {
    const listener = () => {
      setWindowHeight(window.innerHeight)
    }
    const intervalHandle = setInterval(listener, 500)
    window.addEventListener("resize", listener)
    return () => {
      window.removeEventListener("resize", listener)
      clearInterval(intervalHandle)
    }
  })
  const editorHeight = Math.min(windowHeight, 500)

  const state = useEditorState()
  const [prefs, setPrefs] = useEditorPreferences()

  const alerts = useAlerts()

  const toggleLeftPanel = () => {
    setPrefs((before) => ({
      ...before,
      leftOpen: !before.leftOpen,
    }))
  }

  function onFileSelect(path: string) {
    state.fs.read(path).then(
      (s) => {
        if (!path.endsWith("/")) {
          state.setSourceCode({
            path: path,
            contents: s,
            language: "thy",
          })
        }
      },
      (e) => {
        alerts.showAlert(`Failed to open file: ${e.message || e}`)
      },
    )
  }

  async function onFileDelete(path: string) {
    const confirmed = await alerts.confirm(
      `Are you sure you want to delete "${path}"?`,
    )
    if (!confirmed) return

    // If the deleted file is currently open, clear the editor
    if (state.sourceCode.path === path) {
      state.setSourceCode({
        path: "",
        contents: "",
        language: "thy",
      })
    }

    alerts.showToast(`Deleted ${path}`, "info")
  }

  function onFileRename(oldPath: string, newPath: string) {
    // If the renamed file affects the open file, update the title
    if (state.sourceCode.path.startsWith(oldPath)) {
      const newFilePath = state.sourceCode.path.replace(oldPath, newPath)
      state.setSourceCode({
        ...state.sourceCode,
        path: newFilePath,
      })
      alerts.showToast(`Renamed ${oldPath} to ${newPath}`, "success")
    }
  }

  function onSourceUpdate(s: string) {
    state.setSourceCode({
      path: state.sourceCode.path,
      contents: s,
      language: "thy",
    })
    state.fs.write(state.sourceCode.path, s).then(
      () => {
        // Do nothing.
      },
      (e) => {
        alerts.showAlert(`Failed to save file: ${e.message || e}`)
      },
    )
  }

  const minLeftWidth = 100
  function onLeftMenuResize({ dx }: { dx: number }): void {
    setPrefs((before) => ({
      ...before,
      leftWidth: Math.max(before.leftWidth + dx, minLeftWidth),
    }))
  }
  const minRightWidth = 100
  function onRightMenuResize({ dx }: { dx: number }): void {
    setPrefs((before) => ({
      ...before,
      rightWidth: Math.max(before.rightWidth - dx, minRightWidth),
    }))
  }

  return (
    <div
      class="playground-container"
      style={`height:100vh;height:${windowHeight}px;overflow: hidden; display: flex; flex-direction: row;`}
    >
      <div
        style={`flex-grow: 1; height:100vh;height:${windowHeight}px;overflow: hidden; display: flex; flex-direction: column;`}
      >
        <Menu fs={state.fs} state={state} toggleLeftPanel={toggleLeftPanel} />
        <div style={`flex-grow: 1;overflow: hidden; display: flex;`}>
          {prefs.leftOpen && (
            <>
              <div
                style={`flex-shrink: 0; width: ${prefs.leftWidth}px; background-color: #272822; color: #ddd; padding: 10px;`}
              >
                <FileTree
                  fs={state.fs}
                  directory="/"
                  onSelect={onFileSelect}
                  onDelete={onFileDelete}
                  onRename={onFileRename}
                />
              </div>
              <Resizer resizeType="vertical" onResize={onLeftMenuResize} />
            </>
          )}
          <div
            style={`position:relative; width: 100%; height: 100%; flex-grow: 1; overflow: none; background-color: #272822; color: #ddd;`}
          >
            <div style={`padding-left: 20px; padding-top: 10px;`}>
              {state.sourceCode.path}
            </div>
            <CodeInput
              id="editor"
              style={`position:relative; width: 100%; height: 100%; flex-grow: 1; overflow: auto; background-color: #272822;`}
              language={state.sourceCode.language}
              value={state.sourceCode.contents}
              setValue={onSourceUpdate}
              runCode={() => state.runThenSetOutput(state.sourceCode.contents)}
            ></CodeInput>
          </div>
          <Resizer resizeType="vertical" onResize={onRightMenuResize} />
          <div
            style={`flex-shrink: 0; width: ${prefs.rightWidth}px; margin: 10px;`}
          >
            <OutputContainer output={state.output} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Playground() {
  return (
    <AlertProvider>
      <PlaygroundContent />
    </AlertProvider>
  )
}

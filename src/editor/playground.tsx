import { useEffect, useMemo, useRef, useState } from "preact/hooks"
import { AlertProvider, useAlerts } from "./alert-provider.tsx"
import CodeInput from "./code-input.tsx"
import { FileTree } from "./file/tree-ui/file-tree.tsx"
import Menu from "./menu.tsx"
import OutputContainer from "./output-container.tsx"
import { useEditorPreferences } from "./preferences.ts"
import Resizer from "./resizer.tsx"
import { useSourceCodeManager } from "./source-code/manager.ts"
import { makeInMemoryFiles } from "./file/in-memory-files.ts"

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

  const fs = useMemo(() => makeInMemoryFiles(() => new Date().getTime()), [])
  const scm = useSourceCodeManager(fs)
  const [prefs, setPrefs] = useEditorPreferences()

  const alerts = useAlerts()

  const toggleLeftPanel = () => {
    setPrefs((before) => ({
      ...before,
      leftOpen: !before.leftOpen,
    }))
  }

  function onFileSelect(path: string) {
    alerts.catch(scm.selectFile(path), "Failed to open file")
  }

  async function onFileDelete(path: string) {
    const confirmed = await alerts.confirm(
      `Are you sure you want to delete "${path}"?`,
    )
    if (!confirmed) return

    alerts.catch(scm.selectFile(null), "Failed to close file")

    alerts.showToast(`Deleted ${path}`, "info")
  }

  function onFileRename(oldPath: string, newPath: string) {
    // If the renamed file affects the open file, update the title
    if (scm.sourceOpen && scm.sourceOpen.path.startsWith(oldPath)) {
      const newFilePath = scm.sourceOpen.path.replace(oldPath, newPath)
      alerts.catch(scm.selectFile(newFilePath), "Failed to follow renamed file")
      alerts.showToast(`Renamed ${oldPath} to ${newPath}`, "success")
    }
  }

  function onSourceUpdate(s: string) {
    alerts.catch(scm.updateSource(s), "Failed to write file", "toast")
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
        <Menu fs={fs} scm={scm} toggleLeftPanel={toggleLeftPanel} />
        <div style={`flex-grow: 1;overflow: hidden; display: flex;`}>
          {prefs.leftOpen && (
            <>
              <div
                style={`flex-shrink: 0; width: ${prefs.leftWidth}px; background-color: #272822; color: #ddd; padding: 10px;`}
              >
                <FileTree
                  fs={fs}
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
            {scm.sourceOpen && (
              <>
                <div style={`padding-left: 20px; padding-top: 10px;`}>
                  {scm.sourceOpen.path}
                </div>
                <CodeInput
                  id="editor"
                  style={`position:relative; width: 100%; height: 100%; flex-grow: 1; overflow: auto; background-color: #272822;`}
                  language={scm.sourceOpen.language}
                  value={scm.sourceOpen.contents}
                  setValue={onSourceUpdate}
                  runCode={() => alerts.catch(scm.run())}
                >
                </CodeInput>
              </>
            )}
          </div>
          <Resizer resizeType="vertical" onResize={onRightMenuResize} />
          <div
            style={`flex-shrink: 0; width: ${prefs.rightWidth}px; margin: 10px;`}
          >
            <OutputContainer output={scm.output} />
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

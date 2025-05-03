import { useEffect, useState } from "preact/hooks"
import CodeInput from "./code-input"
import Menu from "./menu"
import OutputContainer from "./output-container"
import { useEditorState } from "./state"
import Resizer from "./resizer"
import { useEditorPreferences } from "./preferences"
import AppBar from "./component/app-bar"
import { ExampleFileTree, FileTree } from "./file/file-tree"
import { InMemoryFiles, makeInMemoryFiles } from "./file/in-memory-files"

export default function Playground() {
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

  const [fs, setFs] = useState<InMemoryFiles>(() => {
    const fs = makeInMemoryFiles(() => new Date().getTime())
    return fs
  })
  async function configureExampleFs() {
    await fs.mkdir("/test-subdir")
    await fs.write("/test-subdir/a.thy", "print \"a\"")
    await fs.write("/test-subdir/b.thy", "print \"b\"")
    await fs.write("/main.thy", "print \"himom\"")
  }
  useEffect(() => {
    configureExampleFs()
  }, [fs])


  const state = useEditorState()
  const [prefs, setPrefs] = useEditorPreferences()

  function onFileSelect(path: string) {
    console.log(path)
    fs.read(path).then((s) => {
      if (!path.endsWith("/")) {
        state.setSourceCode({
          path: path,
          contents: s
        })
      }
    }, (e) => {
      // TODO: Surface error.
      console.error(e)
    })
  }

  function onSourceUpdate(s: string) {
    state.setSourceCode({path: state.sourceCode.path, contents: s})
    fs.write(state.sourceCode.path, s).then(() => {
      // Do nothing.
    }, (e) => {
      // TODO: Surface error.
      console.error(e)
    })
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
        <Menu state={state} />
        <div style={`flex-grow: 1;overflow: hidden; display: flex;`}>
          { prefs.leftOpen && <>
          <div
            style={`flex-shrink: 0; width: ${prefs.leftWidth}px; background-color: #272822; color: #ddd; padding: 10px;`}
          >
            <FileTree
              fs={fs}
              directory="/"
              onSelect={onFileSelect}
            />
          </div>
          <Resizer resizeType="vertical" onResize={onLeftMenuResize} />
          </> }
          <div style={`position:relative; width: 100%; height: 100%; flex-grow: 1; overflow: none; background-color: #272822; color: #ddd;`}>
            <div style={`padding-left: 20px; padding-top: 10px;`}>{state.sourceCode.path}</div>
          <CodeInput
            id="editor"
            style={`position:relative; width: 100%; height: 100%; flex-grow: 1; overflow: auto; background-color: #272822;`}
            language={state.editorLanguage}
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

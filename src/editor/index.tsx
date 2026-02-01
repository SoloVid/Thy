import "preact/debug"

import { render } from "preact"
import Playground from "./playground.tsx"

window.onbeforeunload = function () {
  return true
}

render(<Playground />, document.getElementById("app") as HTMLElement)

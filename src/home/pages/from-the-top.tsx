import "preact/debug"

import { render } from "preact"
import { useEffect, useState } from "preact/hooks"
import { home } from "../links"

export default function App() {
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

  return <div class="background">
    <div class="column-content-sm">
    <a href={home}><h1 class="text-center">Thy (lang)</h1></a>
      <h4 class="text-center">
        <em>My language is thy language</em>
      </h4>
    </div>
    <div class="column-content-sm">
      <p>
        TODO: Transcribe (or generate from) the markdown page in Thy repo.
      </p>
    </div>
  </div>
}

render(<App />, document.getElementById('app') as HTMLElement);

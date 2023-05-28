import "preact/debug"

import { render } from "preact"
import { useEffect, useState } from "preact/hooks"
import { baklavaJs, baklavaThy } from "../example/baklava"
import { josephusJs, josephusThy } from "../example/josephus"
import TsThyComparison from "../ts-thy-comparison"
import { home, playgroundBaseUrl } from "../links"

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
        This page provides some example algorithms as implemented in TypeScript and in Thy.
      </p>
    </div>
    <div class="column-content-sm">
      <h4>Baklava</h4>
      <p>
        This example program (called <a href="https://sampleprograms.io/projects/baklava/" target="_blank">Baklava</a>) demonstrates basic looping and printing,
        as well as using JavaScript functionality (<code>.repeat()</code> in this case).
      </p>
    </div>
    <div class="column-content-md">
      <TsThyComparison
        ts={baklavaJs}
        thy={baklavaThy}
        playground={playgroundBaseUrl}
      ></TsThyComparison>
    </div>
    <div class="column-content-sm">
      <h4>Josephus Problem</h4>
      <p>
        The <a href="https://sampleprograms.io/projects/josephus-problem/" target="_blank">Josephus Problem</a> demonstrates a recursive algorithm.
      </p>
    </div>
    <div class="column-content-md">
      <TsThyComparison
        ts={josephusJs}
        thy={josephusThy}
        playground={playgroundBaseUrl}
      ></TsThyComparison>
    </div>
  </div>
}

render(<App />, document.getElementById('app') as HTMLElement);

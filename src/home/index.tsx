import "preact/debug"

import { render } from "preact"
import { useEffect, useState } from "preact/hooks"
import { Background } from "./background"
import CodeBlock from "./code-block"
import CodeComparison from "./code-comparison"
import Button, { TryButton } from "./button"
// import loadLanguages from "prismjs/components/"
import "prismjs/components/prism-typescript"
import { baklavaJs, baklavaThy } from "./example/baklava"
import { josephusJs, josephusThy } from "./example/josephus"
import TsThyComparison from "./ts-thy-comparison"
import { fizzBuzzThy } from "./example/fizz-buzz"

// loadLanguages(['typescript']);

const playgroundBaseUrl = "file:///C:/Users/grant/code/maven/thy/playground/index.html"

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
      <h1 class="text-center">Thy (lang)</h1>
      <h4 class="text-center">
        <em>My language is thy language</em>
      </h4>
    </div>
    <div class="column-content-sm">
      <p>
        Thy is a programming language that is <strong>simple</strong> enough to <em>program on your phone</em>, <strong>powerful</strong> enough to <em>integrate with TypeScript</em>,
        and <strong>familiar</strong> enough to <em>not alienate developers</em>.
      </p>

      <p>
        Here are Thy's core design goals:
      </p>

      <ul>
        <li>No special characters (mobile friendly)</li>
        <li>Natural (relative to mainstream programming)</li>
        <li>Strong static types</li>
        <li>Simple compiler</li>
        <li>Simple rules</li>
        <li>Encourage good programming practices</li>
        <li>Concise (not extremely verbose)</li>
      </ul>
    </div>
    <div class="column-content-sm">
      <h4>So what does it look like?</h4>
    </div>
    <div class="column-content-sm">
      <CodeBlock
        source={fizzBuzzThy}
        language="thy"
      ></CodeBlock>
      <TryButton playgroundUrl={playgroundBaseUrl} source={fizzBuzzThy}></TryButton>
    </div>
    <div class="column-content-sm">
      <p>
        And...an obligatory "Hello World" program:
      </p>
      <CodeBlock
        source={`print "himom"`}
        language="thy"
      ></CodeBlock>
      <TryButton playgroundUrl={playgroundBaseUrl} source={`print "himom"`}></TryButton>
    </div>
    <div class="column-content-sm">
      <p>
        Here's some text that introduces this second thing that is a comparison.
      </p>
    </div>
    <div class="column-content-md">
      <TsThyComparison
        ts={`console.log("himom")`}
        thy={`print "himom"`}
        playground={playgroundBaseUrl}
      ></TsThyComparison>
    </div>
    <div class="column-content-sm">
      <p>
        This is ... <a href="https://sampleprograms.io/projects/josephus-problem/" target="_blank">Josephus</a>.
      </p>
    </div>
    <div class="column-content-md">
      <TsThyComparison
        ts={josephusJs}
        thy={josephusThy}
        playground={playgroundBaseUrl}
      ></TsThyComparison>
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
  </div>
}

render(<App />, document.getElementById('app') as HTMLElement);

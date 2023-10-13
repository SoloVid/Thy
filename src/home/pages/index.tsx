import { TryButton } from "../button"
import CodeBlock from "../code-block"
import { fizzBuzzThy } from "../example/fizz-buzz"
import { typesThy } from "../example/types"
import { home, playgroundBaseUrl } from "../links"
import { renderStandardPage } from "../standard-page-frame"

renderStandardPage("Thy (lang)", <>
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

    <h4>Where to?</h4>
    <ul>
      <li><a href="vs-typescript.html">I know TypeScript. I want to compare.</a></li>
      <li><a href="from-the-top.html">I want Thy explained to me like I've never programmed before.</a></li>
      <li><a href="algorithms.html">I need to see some actual algorithms.</a></li>
      <li><a href="misc-notes.html">I want to hear Grant ramble about language design minutia.</a></li>
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
    <h4>What about <em>types</em>?</h4>
    <p>
      You may feel slighted on the type front for the previous examples.
      Not to worry, Thy <em>does</em> support strong types (using TypeScript's type-checking).
      However, this feature is not fully implemented in the tooling at this point in time.
    </p>
  </div>
  <div class="column-content-sm">
    <CodeBlock
      source={typesThy}
      language="thy"
    ></CodeBlock>
    <TryButton playgroundUrl={playgroundBaseUrl} source={typesThy}></TryButton>
  </div>
  <div class="column-content-sm">
    <h4>Why should I use Thy?</h4>
    <p>You shouldn't.</p>
    <p>
      I have a grand vision for building out a fully functional game development ecosystem with Thy as part of it.
      But until those tools are developed, Thy is only really useful for self-contained small problems
      like <a href="https://adventofcode.com" target="_blank">Advent of Code</a> or writing out notional code on your phone as a sort of shorthand.
    </p>
  </div>
  <div class="column-content-sm">
    <p>
      <small>
        From the mind of <a href="https://www.codehousing.com" target="_blank">Grant</a>,
        source <a href="https://github.com/SoloVid/Thy" target="_blank">on GitHub</a>.
      </small>
    </p>
  </div>
</>)

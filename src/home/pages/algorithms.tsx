import { baklavaJs, baklavaThy } from "../example/baklava"
import { josephusJs, josephusThy } from "../example/josephus"
import { playgroundBaseUrl } from "../links"
import { renderStandardPage } from "../standard-page-frame"
import TsThyComparison from "../ts-thy-comparison"

renderStandardPage("Algorithms - Thy (lang)", <>
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
</>)

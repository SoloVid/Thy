import { callAssignThy, callAssignTs } from "../example/basic/call-assign"
import { classesThy, classesThy2, classesTs, classesTs2 } from "../example/basic/classes"
import { commentsThy, commentsTs } from "../example/basic/comments"
import { errorsThy, errorsTs } from "../example/basic/errors"
import { functionsThy, functionsTs } from "../example/basic/functions"
import { ifThy, ifTs } from "../example/basic/if"
import { loopsThy, loopsTs } from "../example/basic/loops"
import { objectsThy, objectsTs } from "../example/basic/objects"
import { playgroundBaseUrl } from "../links"
import { renderStandardPage } from "../standard-page-frame"
import TsThyComparison from "../ts-thy-comparison"

renderStandardPage("Thy vs. TypeScript", <>
  <div class="column-content-sm">
    <p>
      This page provides some direct comparisons of features in TypeScript versus those in Thy.
    </p>
  </div>
  <div class="column-content-sm">
    <h4>Basic Calls and Assignments</h4>
    <p>
      Every line in Thy has <strong>exactly one function call</strong>.
      The output of the function can optionally be captured in a variable.
    </p>
    <p>
      <em>Shhh! Don't tell anyone about the mutable variable form!</em>
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={callAssignTs}
      thy={callAssignThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <h4>Conditionals</h4>
    <p>
      Conditionals in Thy are all done with the <code>if</code> <em>function</em>.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={ifTs}
      thy={ifThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <h4>Loops</h4>
    <p>
      Loops in Thy are all done with different <code>loop</code> functions.
    </p>
    <p>
      Note: Thy has a dedicated keyword <code>let</code> to allow early returns,
      since loops and conditionals are not a language-level construct.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={loopsTs}
      thy={loopsThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <h4>Objects / Arrays</h4>
    <p>
      Objects are implemented as a language feature in Thy.
      Arrays are built with a standard library function.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={objectsTs}
      thy={objectsThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <h4>Functions</h4>
    <p>
      Functions in Thy are more akin to arrow functions in TypeScript
      than to traditional <code>function</code>s in JavaScript.
    </p>
    <p>
      Note: Type inference and closure rules are similar in Thy to TypeScript.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={functionsTs}
      thy={functionsThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <h4>Error Handling (try/catch)</h4>
    <p>
      Error handling should feel pretty similar to TypeScript.
      Again, like <code>if</code>, <code>try</code> is just a standard library function.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={errorsTs}
      thy={errorsThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <h4>Classes</h4>
    <p>
      Thy doesn't have classes, but you accomplish something very similar.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={classesTs}
      thy={classesThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <p>
      Thy's format basically translates to an arrow function returning an object literal.
    </p>
    <p>
      Thy's <code>private</code> and <code>export</code> keywords can be optional depending on the context.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={classesTs2}
      thy={classesThy2}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
  <div class="column-content-sm">
    <h4>Comments</h4>
    <p>
      Comments in Thy are lines that start with a capital letter.
      Yes, this means that your variables all have to start with lower-case letters.
    </p>
    <p>
      Multi-line comments in Thy are started with 3+ capital letters
      and ended with the same sequence.
    </p>
  </div>
  <div class="column-content-md">
    <TsThyComparison
      ts={commentsTs}
      thy={commentsThy}
      playground={playgroundBaseUrl}
    ></TsThyComparison>
  </div>
</>)

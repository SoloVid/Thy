// @ts-expect-error This import is only valid because of esbuild magic.
import lessonsMd from "../../../docs/imperative-programming-101.md"
import { ThyMarkdown } from "../markdown-code-block-replace"
import { renderStandardPage } from "../standard-page-frame"

const lessonsMdAsString = lessonsMd as string

renderStandardPage("From the Top - Thy (lang)", <>
  <div class="column-content-sm">
    <ThyMarkdown>{lessonsMdAsString}</ThyMarkdown>
  </div>
</>)

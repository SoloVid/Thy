// @ts-expect-error This import is only valid because of esbuild magic.
import specMd from "../../../docs/language-spec.md"
import { ThyMarkdown } from "../markdown-code-block-replace"
import { renderStandardPage } from "../standard-page-frame"

const specMdAsString = specMd as string

renderStandardPage("Language Spec - Thy (lang)", <>
  <div class="column-content-md">
    <ThyMarkdown noTry>{specMdAsString}</ThyMarkdown>
  </div>
</>)

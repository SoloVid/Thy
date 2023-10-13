// @ts-expect-error This import is only valid because of esbuild magic.
import notesMd from "../../../notes.md"
import { ThyMarkdown } from "../markdown-code-block-replace"
import { renderStandardPage } from "../standard-page-frame"

const notesMdAsString = notesMd as string

renderStandardPage("Misc Notes - Thy (lang)", <>
  <div class="column-content-sm">
    <p>
      This page dumps some unsorted thoughts regarding Thy's language design.
      There is a decent chance these notes are significantly out of date with the current implementation.
    </p>
  </div>
  <div class="column-content-sm">
    <ThyMarkdown>{notesMdAsString}</ThyMarkdown>
  </div>
</>)

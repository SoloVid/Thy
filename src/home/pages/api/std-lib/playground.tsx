// @ts-expect-error Import only valid because of esbuild magic.
import encodeURIComponentDoc from "../../../../../docs/std-lib/playground/encode-uri-component.md"
// @ts-expect-error Import only valid because of esbuild magic.
import fetchDoc from "../../../../../docs/std-lib/playground/fetch.md"
// @ts-expect-error Import only valid because of esbuild magic.
import fileDeleteDoc from "../../../../../docs/std-lib/playground/file.delete.md"
// @ts-expect-error Import only valid because of esbuild magic.
import fileExistsDoc from "../../../../../docs/std-lib/playground/file.exists.md"
// @ts-expect-error Import only valid because of esbuild magic.
import fileListDoc from "../../../../../docs/std-lib/playground/file.list.md"
// @ts-expect-error Import only valid because of esbuild magic.
import fileReadDoc from "../../../../../docs/std-lib/playground/file.read.md"
// @ts-expect-error Import only valid because of esbuild magic.
import fileWriteDoc from "../../../../../docs/std-lib/playground/file.write.md"
import { playgroundBaseUrl } from "../../../links"

import { makeMultiMarkdown } from "../../../multi-markdown"
import { renderStandardPage } from "../../../standard-page-frame"

const sections = [
  ["encodeURIComponent", encodeURIComponentDoc, "encode-uri-component"],
  ["fetch", fetchDoc],
  ["file.delete", fileDeleteDoc],
  ["file.exists", fileExistsDoc],
  ["file.list", fileListDoc],
  ["file.read", fileReadDoc],
  ["file.write", fileWriteDoc],
] as const

const { toc, renderedSections } = makeMultiMarkdown(sections)

renderStandardPage("Playground Standard Library - Thy (lang)", <>
  <div class="column-content-sm">
    <h2>Overview</h2>
    <p>
      In addition to the Core Standard Library,
      the <a href={playgroundBaseUrl} target="_blank">Thy Playground</a> also
      provides a set of functions and values specific to that environment.
      Where appropriate, links are provided to equivalent
      JavaScript functionality for further reading.
    </p>
    <h2>On this page</h2>
    <ul>
      {toc}
    </ul>
  </div>
  <div class="column-content-sm">
    {renderedSections}
  </div>
</>)

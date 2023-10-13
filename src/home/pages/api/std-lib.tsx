// @ts-expect-error Import only valid because of esbuild magic.
import arrayDoc from "../../../../docs/std-lib/array.md"
// @ts-expect-error Import only valid because of esbuild magic.
import castDoc from "../../../../docs/std-lib/cast.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkAllDoc from "../../../../docs/std-lib/check.all.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkAscDoc from "../../../../docs/std-lib/check.asc.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkDescDoc from "../../../../docs/std-lib/check.desc.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkEqualDoc from "../../../../docs/std-lib/check.equal.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkNotDoc from "../../../../docs/std-lib/check.not.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkSomeDoc from "../../../../docs/std-lib/check.some.md"
// @ts-expect-error Import only valid because of esbuild magic.
import defDoc from "../../../../docs/std-lib/def.md"
// @ts-expect-error Import only valid because of esbuild magic.
import getDoc from "../../../../docs/std-lib/get.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mutableArrayDoc from "../../../../docs/std-lib/mutable-array.md"
// @ts-expect-error Import only valid because of esbuild magic.
import setDoc from "../../../../docs/std-lib/set.md"
import { ThyMarkdown } from "../../markdown-code-block-replace"
import { renderStandardPage } from "../../standard-page-frame"

const sections = [
  ["array", arrayDoc],
  ["cast", castDoc],
  ["check.all", checkAllDoc],
  ["check.asc", checkAscDoc],
  ["check.desc", checkDescDoc],
  ["check.equal", checkEqualDoc],
  ["check.not", checkNotDoc],
  ["check.some", checkSomeDoc],
  ["def", defDoc],
  ["get", getDoc],
  ["mutableArray", mutableArrayDoc],
  ["set", setDoc],
] as const

function nameAsId(name: string) {
  return name.replace(/[^a-z]/g, "-")
}

const toc = sections.map(([name]) => <>
  <li><a href={`#${nameAsId(name)}`}>{name}</a></li>
</>)

const renderedSections = sections.map(([name, doc]) => <>
  <hr/>
  <a href={`#${nameAsId(name)}`}>
    <h3 id={nameAsId(name)}>{name}</h3>
  </a>
  <ThyMarkdown noTry>{doc}</ThyMarkdown>
  <em><a href="#top">back to top</a></em>
</>)

renderStandardPage("Standard Library - Thy (lang)", <>
  <div class="column-content-sm">
    <h2>Overview</h2>
    <p>
      The standard library for Thy is the base set of functions
      that should be available in any Thy runtime environment.
      Many of these functions are provided as language features
      in other languages.
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

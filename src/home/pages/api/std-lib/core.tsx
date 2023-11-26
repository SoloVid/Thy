// @ts-expect-error Import only valid because of esbuild magic.
import arrayDoc from "../../../../../docs/std-lib/core/array.md"
// @ts-expect-error Import only valid because of esbuild magic.
import arrayMutableDoc from "../../../../../docs/std-lib/core/array-mutable.md"
// @ts-expect-error Import only valid because of esbuild magic.
import castDoc from "../../../../../docs/std-lib/core/cast.md"
// @ts-expect-error Import only valid because of esbuild magic.
import catchDoc from "../../../../../docs/std-lib/core/catch.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkAllDoc from "../../../../../docs/std-lib/core/check.all.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkAscDoc from "../../../../../docs/std-lib/core/check.asc.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkDescDoc from "../../../../../docs/std-lib/core/check.desc.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkEqualDoc from "../../../../../docs/std-lib/core/check.equal.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkNotDoc from "../../../../../docs/std-lib/core/check.not.md"
// @ts-expect-error Import only valid because of esbuild magic.
import checkSomeDoc from "../../../../../docs/std-lib/core/check.some.md"
// @ts-expect-error Import only valid because of esbuild magic.
import defDoc from "../../../../../docs/std-lib/core/def.md"
// @ts-expect-error Import only valid because of esbuild magic.
import delayDoc from "../../../../../docs/std-lib/core/delay.md"
// @ts-expect-error Import only valid because of esbuild magic.
import elseDoc from "../../../../../docs/std-lib/core/else.md"
// @ts-expect-error Import only valid because of esbuild magic.
import falseDoc from "../../../../../docs/std-lib/core/false.md"
// @ts-expect-error Import only valid because of esbuild magic.
import finallyDoc from "../../../../../docs/std-lib/core/finally.md"
// @ts-expect-error Import only valid because of esbuild magic.
import getDoc from "../../../../../docs/std-lib/core/get.md"
// @ts-expect-error Import only valid because of esbuild magic.
import ifDoc from "../../../../../docs/std-lib/core/if.md"
// @ts-expect-error Import only valid because of esbuild magic.
import jsonDecodeDoc from "../../../../../docs/std-lib/core/json.decode.md"
// @ts-expect-error Import only valid because of esbuild magic.
import jsonEncodeDoc from "../../../../../docs/std-lib/core/json.encode.md"
// @ts-expect-error Import only valid because of esbuild magic.
import loopAsyncDoc from "../../../../../docs/std-lib/core/loop.async.md"
// @ts-expect-error Import only valid because of esbuild magic.
import loopElementsDoc from "../../../../../docs/std-lib/core/loop.elements.md"
// @ts-expect-error Import only valid because of esbuild magic.
import loopForeverDoc from "../../../../../docs/std-lib/core/loop.forever.md"
// @ts-expect-error Import only valid because of esbuild magic.
import loopTimesDoc from "../../../../../docs/std-lib/core/loop.times.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mapDoc from "../../../../../docs/std-lib/core/map.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mathAddDoc from "../../../../../docs/std-lib/core/math.add.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mathDivideDoc from "../../../../../docs/std-lib/core/math.divide.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mathModDoc from "../../../../../docs/std-lib/core/math.mod.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mathMultiplyDoc from "../../../../../docs/std-lib/core/math.multiply.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mathPowDoc from "../../../../../docs/std-lib/core/math.pow.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mathRootDoc from "../../../../../docs/std-lib/core/math.root.md"
// @ts-expect-error Import only valid because of esbuild magic.
import mathSubtractDoc from "../../../../../docs/std-lib/core/math.subtract.md"
// @ts-expect-error Import only valid because of esbuild magic.
import nullDoc from "../../../../../docs/std-lib/core/null.md"
// @ts-expect-error Import only valid because of esbuild magic.
import printDoc from "../../../../../docs/std-lib/core/print.md"
// @ts-expect-error Import only valid because of esbuild magic.
import regexDoc from "../../../../../docs/std-lib/core/regex.md"
// @ts-expect-error Import only valid because of esbuild magic.
import setDoc from "../../../../../docs/std-lib/core/set.md"
// @ts-expect-error Import only valid because of esbuild magic.
import stringDoc from "../../../../../docs/std-lib/core/string.md"
// @ts-expect-error Import only valid because of esbuild magic.
import switchDoc from "../../../../../docs/std-lib/core/switch.md"
// @ts-expect-error Import only valid because of esbuild magic.
import throwDoc from "../../../../../docs/std-lib/core/throw.md"
// @ts-expect-error Import only valid because of esbuild magic.
import trueDoc from "../../../../../docs/std-lib/core/true.md"
// @ts-expect-error Import only valid because of esbuild magic.
import tryDoc from "../../../../../docs/std-lib/core/try.md"

import { ThyMarkdown } from "../../../markdown-code-block-replace"
import { renderStandardPage } from "../../../standard-page-frame"

const sections = [
  ["array", arrayDoc],
  ["arrayMutable", arrayMutableDoc],
  ["cast", castDoc],
  ["catch", catchDoc],
  ["check.all", checkAllDoc],
  ["check.asc", checkAscDoc],
  ["check.desc", checkDescDoc],
  ["check.equal", checkEqualDoc],
  ["check.not", checkNotDoc],
  ["check.some", checkSomeDoc],
  ["def", defDoc],
  ["delay", delayDoc],
  ["else", elseDoc],
  ["false", falseDoc],
  ["finally", finallyDoc],
  ["get", getDoc],
  ["if", ifDoc],
  ["json.decode", jsonDecodeDoc],
  ["json.encode", jsonEncodeDoc],
  ["loop.async", loopAsyncDoc],
  ["loop.elements", loopElementsDoc],
  ["loop.forever", loopForeverDoc],
  ["loop.times", loopTimesDoc],
  ["map", mapDoc],
  ["math.add", mathAddDoc],
  ["math.divide", mathDivideDoc],
  ["math.mod", mathModDoc],
  ["math.multiply", mathMultiplyDoc],
  ["math.pow", mathPowDoc],
  ["math.root", mathRootDoc],
  ["math.subtract", mathSubtractDoc],
  ["null", nullDoc],
  ["print", printDoc],
  ["regex", regexDoc],
  ["set", setDoc],
  ["string", stringDoc],
  ["switch", switchDoc],
  ["throw", throwDoc],
  ["true", trueDoc],
  ["try", tryDoc],
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
      The standard library for Thy is the base set of functions and values
      that should be available in any Thy runtime environment.
      Many of these functions are provided as language features
      in other languages.
      Where appropriate, links are provided to equivalent
      TypeScript functionality for further reading.
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

import { makeSimpleThyExport as _makeExport } from "thy-lang/std-lib"
import { core as _core } from "thy-lang/std-lib"

export default _makeExport(_core, () => {
  const s = `${true}${"B" as const}${3 as const}`
  console.log(s)
})

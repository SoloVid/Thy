import { makeThyExport as _makeExport } from "thy-lang/std-lib"
import { core as _core } from "thy-lang/std-lib"
import _dep1 from "./a.thy"

const _depMap = {
  "a.thy": [
    {
      id: "a.thy",
      init: _dep1,
    },
  ],
} as const

export default _makeExport(_core, _depMap, (_1L = {} as never) => {
  const _1 = { ..._1L as (typeof _1L extends never ? {} : typeof _1L), ...{} } as const
  const a = _1.thy("a.thy" as const)
  return a.value
})

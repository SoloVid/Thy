import { makeThyExport as _makeExport } from "thy-lang/std-lib"
import { core as _core } from "thy-lang/std-lib"

const _depMap = {
} as const

export default _makeExport(_core, _depMap, () => {
  const value = 5 as const
  return {
    value,
  }
})

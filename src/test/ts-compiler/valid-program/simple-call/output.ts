import type { Core } from "thy-lang/std-lib"

export function initThy(_global: Core) {
  const s = `${true}${"B" as const}${3 as const}`
  console.log(s)
}

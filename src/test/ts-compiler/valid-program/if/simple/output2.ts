import { ThyCache } from "std-lib/thy/cache"
import type { Core } from "thy-lang/std-lib"
import { callUntyped } from "thy-lang/utils"

export default (cache: ThyCache) => {

  // TODO: Move this into shared location? (generated file?)
  const getGlobals = () => "yo"

  callUntyped(getGlobals(), (_global) => {
    // TODO: This is the generated function body.
    console.log(_global)
  })
}

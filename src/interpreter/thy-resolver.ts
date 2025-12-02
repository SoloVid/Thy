import { resolvePathSpecFromArray } from "std-lib/thy/resolve-path-spec-from-array"
import { resolveThyDependency, ThyCache } from "std-lib/thy/cache"
import type { Block } from "tree"
import assert from "utils/assert"
import { interpretThyBlockNode } from "./block"
import { BlockOptions } from "./block-options"
import { runtimeVoid, yesThisValueIsForRuntime } from "./dynamic-type"

export function makeThyResolver(
  parseMap: Map<string, Readonly<Block>>,
  globals: Record<string, unknown>,
  options: Omit<BlockOptions, "thyResolutionRelativePath" | "resolveThy">,
) {
  const knownFilePaths = [...parseMap.keys()]
  // console.log(knownFilePaths)
  const cache: ThyCache = {
    mine: new Map(),
    inherit: null,
  }
  const resolveFunction = (
    thyResolutionRelativePath: string,
    pathSpec: string,
  ) => {
    const resolvedPaths = resolvePathSpecFromArray(
      thyResolutionRelativePath,
      knownFilePaths,
      pathSpec,
    )
    // console.log(resolvedPaths)
    assert(
      resolvedPaths.length > 0,
      `thy "${pathSpec}" did not resolve from ${thyResolutionRelativePath}`,
    )
    const resolvedValues = resolvedPaths.map((p) =>
      resolveThyDependency(p, cache, (c) => {
        const tree = parseMap.get(p)
        assert(!!tree, `${p} should be parsed`)
        const interpreted = interpretThyBlockNode(tree, {
          ...options,
          // TODO: Fix these values per file?
          // functionName: options.functionName,
          // stackTracePath: options.stackTracePath ?? "inline-thy-code",
          thyResolutionRelativePath: p,
          resolveThy: resolveFunction,
        })
        return interpreted(yesThisValueIsForRuntime(globals))
      }),
    )
    if (resolvedValues.length === 1) {
      return resolvedValues[0]
    }
    return runtimeVoid
  }
  return {
    resolveThy: resolveFunction,
  }
}

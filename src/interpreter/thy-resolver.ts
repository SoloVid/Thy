import { ParseResult } from "compiler/parse-workspace"
import { resolvePathSpecSync } from "std-lib/thy/resolve-path-spec"
import { resolveThy, ThyCache, ThyCacheInit } from "std-lib/thy/thy2"
import type { FileBrowseApi } from "utils/fs/file-browse-api"
import { BlockOptions, interpretThyBlockNode, interpretThyBlockSource } from "./block"
import assert from "utils/assert"

export function makeThyResolver(
  parseMap: Map<string, ParseResult>,
  options: Partial<BlockOptions> = {},
) {
  const knownFilePaths = [...parseMap.keys()]
  // console.log(knownFilePaths)
  const cache: ThyCache = {
    mine: new Map(),
    inherit: null,
  }
  const resolveFunction = (thyResolutionRelativePath: string, pathSpec: string) => {
    const resolvedPaths = resolvePathSpecSync(thyResolutionRelativePath, knownFilePaths, pathSpec)
    // console.log(resolvedPaths)
    assert(resolvedPaths.length > 0, `thy("${pathSpec}") did not resolve from ${thyResolutionRelativePath}`)
    const resolvedValues = resolvedPaths.map(
      p => resolveThy(p, cache, (c) => interpretThyBlockNode(parseMap.get(p)?.tree, {
        ...options,
        thyResolutionRelativePath: p,
        resolveThy: resolveFunction,
      })())
    )
    if (resolvedValues.length === 1) {
      return resolvedValues[0]
    }
  }
  return {
    resolveThy: resolveFunction
  }
}

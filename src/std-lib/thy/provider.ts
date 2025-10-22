import { callUntyped } from "utils/call-untyped"
import { makeThyCache, resolveThy, ThyCache } from "./cache"

type DependencySpec = {
  id: string
  init: (cache: ThyCache) => unknown
}
type DependencyMapBase = Record<string, readonly DependencySpec[]>

type ThyDependencyLib<DependencyMap extends DependencyMapBase> = {
  /**
   * 
   * @param reference ID of dependency as appears in source (relative)
   * @returns 
   */
  thy: <Reference extends string & keyof DependencyMap>(reference: Reference) => DependencySpecInitReturnIfOnlyOne<DependencyMap[Reference]>
}

type DependencySpecInitReturnIfOnlyOne<T extends readonly DependencySpec[]> = [] extends T ? void : (T extends readonly [DependencySpec, DependencySpec] ? void : ReturnType<T[0]["init"]>)

const makeThyDependencyLib = <DependencyMap extends DependencyMapBase>(
  dependencyMap: DependencyMap,
  cache: ThyCache,
): ThyDependencyLib<DependencyMap> => {
  return {
    thy: <Reference extends string & keyof DependencyMap>(reference: Reference) => {
      const results: unknown[] = []
      for (const dep of dependencyMap[reference]) {
        results.push(resolveThy(dep.id, cache, (cache) => dep.init(cache)))
      }
      if (results.length === 1) {
        return results[0] as DependencySpecInitReturnIfOnlyOne<DependencyMap[Reference]>
      }
      return undefined as DependencySpecInitReturnIfOnlyOne<DependencyMap[Reference]>
    }
  }
}

export const makeThyExport = <
  GlobalLib extends Record<string, unknown>,
  DependencyMap extends DependencyMapBase,
  Output extends unknown,
>(
  globalLib: GlobalLib,
  dependencyMap: DependencyMap,
  block: (lib: GlobalLib & ThyDependencyLib<DependencyMap>) => Output,
) => {
  return (cache: ThyCache = makeThyCache()) => {
    const lib = {
      ...globalLib,
      ...makeThyDependencyLib(dependencyMap, cache),
    }
    return callUntyped(lib, block)
  }
}

export const makeSimpleThyExport = <
  GlobalLib extends Record<string, unknown>,
  Output extends unknown,
>(
  globalLib: GlobalLib,
  block: (lib: GlobalLib) => Output,
) => {
  return () => {
    return callUntyped(globalLib, block)
  }
}

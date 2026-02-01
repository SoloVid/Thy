import { callUntyped } from "utils/call-untyped.ts"
import { makeThyCache, resolveThyDependency, ThyCache } from "./cache.ts"

type InitDependencySpec = {
  id: string
  init: (cache: ThyCache) => unknown
}
type SingletonDependencySpec = {
  id: string
  value: unknown
}
type DependencySpec = InitDependencySpec | SingletonDependencySpec
type DependencyMapBase = Record<string, readonly DependencySpec[]>

type ThyDependencyLib<DependencyMap extends DependencyMapBase> = {
  /**
   *
   * @param reference ID of dependency as appears in source (relative)
   * @returns
   */
  thy: <Reference extends string & keyof DependencyMap>(
    reference: Reference,
  ) => DependencySpecValueIfOnlyOne<DependencyMap[Reference]>
}

type DependencySpecValue<T extends DependencySpec> =
  T extends InitDependencySpec
    ? ReturnType<T["init"]>
    : T extends SingletonDependencySpec
      ? T["value"]
      : never
type DependencySpecValueIfOnlyOne<T extends readonly DependencySpec[]> =
  [] extends T
    ? void
    : T extends readonly [DependencySpec, DependencySpec, ...DependencySpec[]]
      ? void
      : DependencySpecValue<T[0]>

const makeThyDependencyLib = <DependencyMap extends DependencyMapBase>(
  dependencyMap: DependencyMap,
  cache: ThyCache,
): ThyDependencyLib<DependencyMap> => {
  return {
    thy: <Reference extends string & keyof DependencyMap>(
      reference: Reference,
    ) => {
      type ThyDepReturnType = DependencySpecValueIfOnlyOne<
        DependencyMap[Reference]
      >
      const dependencies = dependencyMap[reference]
      if (dependencies.length === 1) {
        const dep = dependencies[0]
        if ("value" in dep) {
          return dep.value as ThyDepReturnType
        }
        return resolveThyDependency(dep.id, cache, (cache) =>
          dep.init(cache),
        ) as ThyDepReturnType
      }
      for (const dep of dependencies) {
        if ("init" in dep) {
          resolveThyDependency(dep.id, cache, (cache) => dep.init(cache))
        }
      }
      return undefined as ThyDepReturnType
    },
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

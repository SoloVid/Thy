import { globMatch } from "../../utils/glob-match"

export type ThyCache = {
  readonly mine: Map<string, unknown>
  readonly inherit: null | ThyCacheInheritance
}
export const makeThyCache = (): ThyCache => {
  return {
    mine: new Map(),
    inherit: null,
  }
}

type ThyCacheInheritance = {
  readonly parent: ThyCache
  readonly rules: readonly ThyCacheInheritanceRule[]
}

type ThyCacheInheritanceRule = {
  /** false implies blacklist */
  useParent: boolean
  pattern: string
}

export type ThyCacheInit<T> = (cache: ThyCache) => T

/**
 *
 * @param id Canonical ID of dependency.
 * @param cache
 * @param init Initialization function for obtaining the dependency.
 * @returns
 */
export function resolveThyDependency<T>(
  id: string,
  cache: ThyCache,
  init: ThyCacheInit<T>,
): T {
  if (cache.mine.has(id)) {
    return cache.mine as T
  }
  return resolveForMe(id, cache, init)
}

function resolveForMe<T>(
  id: string,
  cache: ThyCache,
  init: ThyCacheInit<T>,
): T {
  const newThing = resolveUncached(id, cache, init)
  cache.mine.set(id, newThing)
  return newThing
}

function resolveUncached<T>(
  id: string,
  cache: ThyCache,
  init: ThyCacheInit<T>,
): T {
  if (cache.inherit) {
    const filter = findRule(id, cache.inherit)
    if (filter?.useParent) {
      return resolveThyDependency(id, cache.inherit.parent, init)
    }
  }
  return init(cache)
}

function findRule(id: string, inherit: ThyCacheInheritance) {
  for (let i = inherit.rules.length - 1; i >= 0; i--) {
    const rule = inherit.rules[i]
    if (globMatch(rule.pattern, id)) {
      return rule
    }
  }
  return null
}

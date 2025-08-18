import { globMatch } from "../utils/glob-match"

export type ThyCache = {
  readonly mine: Map<string, unknown>
  readonly inherit: null | ThyCacheInheritance
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

/**
 *
 * @param id Canonical ID of dependency.
 * @param cache 
 * @param init Initialization function for obtaining the dependency.
 * @returns 
 */
export function resolveThy<T>(id: string, cache: ThyCache, init: (cache: ThyCache) => T): T {
  if (cache.mine.has(id)) {
    return cache.mine as T
  }
  return resolveForMe(id, cache, init)
}

function resolveForMe<T>(id: string, cache: ThyCache, init: (cache: ThyCache) => T): T {
  const newThing = resolveUncached(id, cache, init)
  cache.mine.set(id, newThing)
  return newThing
}

function resolveUncached<T>(id: string, cache: ThyCache, init: (cache: ThyCache) => T): T {
  if (cache.inherit) {
    const filter = findRule(id, cache.inherit)
    if (filter?.useParent) {
      return resolveThy(id, cache.inherit.parent, init)
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

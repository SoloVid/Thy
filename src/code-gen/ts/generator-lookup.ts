import assert from "assert"
import type { TreeNode, ValueIdentifier, ValuePropertyAccess } from "tree"
import {
  GeneratorForNameParentSpec,
  GeneratorForNameSpec,
  isLeaf,
  isParent,
} from "./generator-for-name"

export type GeneratorForNameSpecWithRequiredMethod<
  RequiredMethod extends keyof GeneratorForNameSpec,
> = GeneratorForNameSpec & Required<Pick<GeneratorForNameSpec, RequiredMethod>>

export type SpecMap<RequiredMethod extends keyof GeneratorForNameSpec> = Map<
  string,
  | GeneratorForNameSpecWithRequiredMethod<RequiredMethod>
  | SpecMap<RequiredMethod>
>

function specHasMethod<RequiredMethod extends keyof GeneratorForNameSpec>(
  spec: GeneratorForNameSpec,
  requiredMethod: RequiredMethod,
): spec is GeneratorForNameSpecWithRequiredMethod<RequiredMethod> {
  return requiredMethod in spec
}

export function makeSpecMap<RequiredMethod extends keyof GeneratorForNameSpec>(
  specs: readonly (GeneratorForNameSpec | GeneratorForNameParentSpec)[],
  requiredMethod: RequiredMethod,
): SpecMap<RequiredMethod> {
  const specMap: SpecMap<RequiredMethod> = new Map()
  for (const spec of specs) {
    if (isParent(spec)) {
      specMap.set(spec.name, makeSpecMap(spec.children, requiredMethod))
    }
    if (isLeaf(spec) && specHasMethod(spec, requiredMethod)) {
      specMap.set(spec.name, spec)
    }
  }
  return specMap
}

export function lookupByName<RequiredMethod extends keyof GeneratorForNameSpec>(
  specMap: SpecMap<RequiredMethod>,
  names: string[],
): null | GeneratorForNameSpecWithRequiredMethod<RequiredMethod> {
  let currentMap = specMap
  while (names.length > 0) {
    const name = names.shift()
    assert(name, "names.shift() should not return undefined")
    const inward = currentMap.get(name)
    if (!inward) {
      return null
    }
    if (inward instanceof Map) {
      currentMap = inward
    } else {
      // If we are not at the end, don't do anything special.
      // e.g. Don't try to turn `if.something` into some native TS conditional construct.
      if (names.length > 0) {
        return null
      }
      return inward
    }
  }
  return null
}

export function tryLookupNamedNode<
  RequiredMethod extends keyof GeneratorForNameSpec,
>(specMap: SpecMap<RequiredMethod>, node: TreeNode) {
  if (node.type === "value-identifier" || node.type === "type-identifier") {
    return lookupByName(specMap, [node.token.text])
  }
  if (
    node.type === "value-property-access" &&
    node.base.type === "value-identifier"
  ) {
    return lookupByName(specMap, [
      node.base.token.text,
      ...node.propertyAccesses.map((pa) => pa.propertyToken.text),
    ])
  }
  return null
}

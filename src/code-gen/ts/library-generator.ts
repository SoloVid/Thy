import assert from "assert"
import { fromToken } from "code-gen/utils/from-token"
import type { Token } from "tokenizer"
import type {
  Assignment,
  Call,
  LetCall,
  TreeNode,
  TypeAssignment,
  TypeCall,
  TypeIdentifier,
  TypePropertyAccess,
  ValueIdentifier,
  ValuePropertyAccess,
} from "tree"
import type { GeneratedSnippets } from "../generator"
import { fromNode } from "../utils/from-node"
import {
  GeneratorForGlobalParentSpec,
  GeneratorForGlobalSpec,
  isLeaf,
  isParent,
} from "./generator-for-global"
import type { GeneratorState } from "./generator-state"
import type { CodeGeneratorFunc } from "./ts-generator"

export interface LibraryGeneratorCollection {
  valueIdentifierGenerator: CodeGeneratorFunc<ValueIdentifier>
  propertyAccessGenerator: CodeGeneratorFunc<ValuePropertyAccess>
  typeInstanceGenerator: CodeGeneratorFunc<
    ValueIdentifier | TypeIdentifier | ValuePropertyAccess | TypePropertyAccess
  >
  callGenerator: CodeGeneratorFunc<Call>
  assignmentGenerator: CodeGeneratorFunc<Assignment>
  letCallGenerator: CodeGeneratorFunc<LetCall>
  typeCallGenerator: CodeGeneratorFunc<TypeCall>
  simpleTypeCallGenerator: CodeGeneratorFunc<TypeCall>
  typeAssignmentGenerator: CodeGeneratorFunc<TypeAssignment>
}

type SpecMap = Map<string, GeneratorForGlobalSpec | SpecMap>

function makeSpecMap(
  specs: readonly (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[],
  requiredMethod: keyof GeneratorForGlobalSpec,
): SpecMap {
  const specMap: SpecMap = new Map()
  for (const spec of specs) {
    if (isParent(spec)) {
      specMap.set(spec.name, makeSpecMap(spec.children, requiredMethod))
    }
    if (isLeaf(spec) && requiredMethod in spec) {
      specMap.set(spec.name, spec)
    }
  }
  return specMap
}

interface LookupResult {
  spec: GeneratorForGlobalSpec | SpecMap
  unusedPropertyAccessTokens: readonly Token[]
}

function lookupByName(
  specMap: SpecMap,
  base: ValueIdentifier,
  propertyAccesses: ValuePropertyAccess["propertyAccesses"],
): null | LookupResult {
  const names = [
    base.token.text,
    ...propertyAccesses.map((pa) => pa.propertyToken.text),
  ]
  let currentMap = specMap
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    // TODO: Is there a scenario here for just returning the `.something` on this group?
    if (!currentMap.has(name)) {
      return null
    }
    const inward = currentMap.get(name)
    assert(inward)
    if (inward instanceof Map) {
      currentMap = inward
    } else {
      return {
        spec: inward,
        unusedPropertyAccessTokens: propertyAccesses
          .slice(i)
          .map((pa) => [pa.memberAccessOperatorToken, pa.propertyToken])
          .flat(),
      }
    }
  }
  return null
}

type GenerateObject = (hierarchy: SpecMap, state: GeneratorState) => string

interface Options {
  generateObject: GenerateObject
}

export function aggregateLibrary(
  libraries: readonly LibraryGeneratorCollection[],
): LibraryGeneratorCollection {
  return {
    valueIdentifierGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.valueIdentifierGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    propertyAccessGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.propertyAccessGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    typeInstanceGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.typeInstanceGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    callGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.callGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    assignmentGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.assignmentGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    letCallGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.letCallGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    typeCallGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.typeCallGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    simpleTypeCallGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.simpleTypeCallGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
    typeAssignmentGenerator(node, state, fixture) {
      for (const lib of libraries) {
        const output = lib.typeAssignmentGenerator(node, state, fixture)
        if (output) {
          return output
        }
      }
    },
  }
}

export function makeLibraryGenerators(
  specs: (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[],
  { generateObject }: Options,
): LibraryGeneratorCollection {
  const valueSpecMap = makeSpecMap(specs, "generateValue")
  const callSpecMap = makeSpecMap(specs, "generateCall")
  const assignmentSpecMap = makeSpecMap(specs, "generateAssignment")
  const letCallSpecMap = makeSpecMap(specs, "generateLetCall")
  const typeCallSpecMap = makeSpecMap(specs, "generateTypeCall")
  const simpleTypeCallSpecMap = makeSpecMap(specs, "generateSimpleTypeCall")
  const typeAssignmentSpecMap = makeSpecMap(specs, "generateTypeAssignment")

  function valueGenerator(
    node: ValueIdentifier | ValuePropertyAccess,
    state: GeneratorState,
  ) {
    const lookup = tryLookupNamedNode(valueSpecMap, node)
    if (lookup === null) {
      return
    }
    let partGeneratedNow: GeneratedSnippets
    if (lookup.spec instanceof Map) {
      partGeneratedNow = fromNode(node, generateObject(lookup.spec, state))
    } else {
      partGeneratedNow = fromNode(node, lookup.spec.generateValue(state))
    }

    if (lookup.unusedPropertyAccessTokens.length > 0) {
      return [
        partGeneratedNow,
        lookup.unusedPropertyAccessTokens.map(t => fromToken(t))
      ]
    } else {
      return partGeneratedNow
    }
  }

  function typeInstanceGenerator(
    node:
      | ValueIdentifier
      | ValuePropertyAccess
      | TypeIdentifier
      | TypePropertyAccess,
    state: GeneratorState,
  ) {
    const lookup = tryLookupNamedNode(valueSpecMap, node)
    if (lookup === null) {
      return
    }
    assert(
      !(lookup.spec instanceof Map),
      "We should never lookup a standard library type name and get a parent.",
    )
    assert(
      lookup.unusedPropertyAccessTokens.length === 0,
      "We should never have leftover trailing property access tokens on standard library type.",
    )
    if (lookup.spec.generateTypeInstance === undefined) {
      return
    }
    return fromNode(node, lookup.spec.generateTypeInstance(state))
  }

  return {
    valueIdentifierGenerator(node, state, fixture) {
      return valueGenerator(node, state)
    },
    propertyAccessGenerator(node, state, fixture) {
      return valueGenerator(node, state)
    },
    typeInstanceGenerator(node, state, fixture) {
      return typeInstanceGenerator(node, state)
    },
    callGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(callSpecMap, node.func)
      if (
        lookup === null ||
        lookup.spec instanceof Map ||
        lookup.spec.generateCall === undefined
      ) {
        return
      }
      return lookup.spec.generateCall(node as any, state, fixture)
    },
    assignmentGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(assignmentSpecMap, node.call.func)
      if (
        lookup === null ||
        lookup.spec instanceof Map ||
        lookup.spec.generateAssignment === undefined
      ) {
        return
      }
      return lookup.spec.generateAssignment(node as any, state, fixture)
    },
    letCallGenerator(node, state, fixture) {
      if (node.call === null) {
        return
      }
      const lookup = tryLookupNamedNode(letCallSpecMap, node.call.func)
      if (
        lookup === null ||
        lookup.spec instanceof Map ||
        lookup.spec.generateLetCall === undefined
      ) {
        return
      }
      return lookup.spec.generateLetCall(node as any, state, fixture)
    },
    typeCallGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(typeCallSpecMap, node.func)
      if (
        lookup === null ||
        lookup.spec instanceof Map ||
        lookup.spec.generateTypeCall === undefined
      ) {
        return
      }
      return lookup.spec.generateTypeCall(node as any, state, fixture)
    },
    simpleTypeCallGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(simpleTypeCallSpecMap, node.func)
      if (
        lookup === null ||
        lookup.spec instanceof Map ||
        lookup.spec.generateSimpleTypeCall === undefined
      ) {
        return
      }
      return lookup.spec.generateSimpleTypeCall(node as any, state, fixture)
    },
    typeAssignmentGenerator(node, state, fixture) {
      const lookup = tryLookupNamedNode(typeAssignmentSpecMap, node.call.func)
      if (
        lookup === null ||
        lookup.spec instanceof Map ||
        lookup.spec.generateTypeAssignment === undefined
      ) {
        return
      }
      return lookup.spec.generateTypeAssignment(node as any, state, fixture)
    },
  }
}

function tryLookupNamedNode(specMap: SpecMap, node: TreeNode) {
  if (node.type === "value-identifier") {
    return lookupByName(specMap, node, [])
  }
  if (
    node.type === "value-property-access" &&
    node.base.type === "value-identifier"
  ) {
    return lookupByName(specMap, node.base, node.propertyAccesses)
  }
  return null
}

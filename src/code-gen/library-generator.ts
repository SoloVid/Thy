import assert from "assert";
import type { Token } from "../tokenizer/token";
import type { tMemberAccessOperator } from "../tokenizer/token-type";
import type { PropertyAccess, TreeNode, TypeCall } from "../tree";
import type { Assignment } from "../tree/assignment";
import type { Atom } from "../tree/atom";
import type { Call } from "../tree/call";
import type { LetCall } from "../tree/let-call";
import { CodeGeneratorFunc, fromNode, GeneratedSnippets } from "./generator";
import { GeneratorForGlobalParentSpec, GeneratorForGlobalSpec, isLeaf, isParent } from "./generator-for-global";
import type { GeneratorState } from "./generator-state";

export interface LibraryGeneratorCollection {
    atomGenerator: CodeGeneratorFunc<Atom>
    propertyAccessGenerator: CodeGeneratorFunc<PropertyAccess<never>>
    typeInstanceGenerator: CodeGeneratorFunc<Atom | PropertyAccess<never>>
    callGenerator: CodeGeneratorFunc<Call>
    assignmentGenerator: CodeGeneratorFunc<Assignment>
    letCallGenerator: CodeGeneratorFunc<LetCall>
    typeCallGenerator: CodeGeneratorFunc<TypeCall>
    simpleTypeCallGenerator: CodeGeneratorFunc<TypeCall>
}

type SpecMap = Map<string, GeneratorForGlobalSpec | SpecMap>

function makeSpecMap(specs: readonly (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[], requiredMethod: keyof GeneratorForGlobalSpec): SpecMap {
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

function lookupByName(specMap: SpecMap, identifier: UnwrappedPropertyAccess): null | LookupResult {
    const names = [identifier[0].text, ...(identifier.slice(1) as readonly PropertyPair[]).map(p => p[1].text)]
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
                unusedPropertyAccessTokens: identifier.slice(i + 1).flat()
            }
        }
    }
    return null
}

type FillOutPropertyAccessExpression = (trailingTokens: readonly Token[]) => GeneratedSnippets
type GenerateObject = (hierarchy: SpecMap, state: GeneratorState) => string

interface Options {
    fillOutPropertyAccessExpression: FillOutPropertyAccessExpression,
    generateObject: GenerateObject
}

export function aggregateLibrary(libraries: readonly LibraryGeneratorCollection[]): LibraryGeneratorCollection {
    return {
        atomGenerator(node, state, fixture) {
            for (const lib of libraries) {
                const output = lib.atomGenerator(node, state, fixture)
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
    }
}

export function makeLibraryGenerators(
    specs: (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[],
    { fillOutPropertyAccessExpression, generateObject }: Options,
): LibraryGeneratorCollection {
    const valueSpecMap = makeSpecMap(specs, "generateValue")
    const callSpecMap = makeSpecMap(specs, "generateCall")
    const assignmentSpecMap = makeSpecMap(specs, "generateAssignment")
    const letCallSpecMap = makeSpecMap(specs, "generateLetCall")
    const typeCallSpecMap = makeSpecMap(specs, "generateTypeCall")
    const simpleTypeCallSpecMap = makeSpecMap(specs, "generateSimpleTypeCall")

    function valueGenerator(node: Atom | PropertyAccess, state: GeneratorState) {
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
            return [partGeneratedNow, fillOutPropertyAccessExpression(lookup.unusedPropertyAccessTokens)]
        } else {
            return partGeneratedNow
        }
    }

    function typeInstanceGenerator(node: Atom | PropertyAccess, state: GeneratorState) {
        const lookup = tryLookupNamedNode(valueSpecMap, node)
        if (lookup === null) {
            return
        }
        assert(!(lookup.spec instanceof Map), "We should never lookup a standard library type name and get a parent.")
        assert(lookup.unusedPropertyAccessTokens.length === 0, "We should never have leftover trailing property access tokens on standard library type.")
        if (lookup.spec.generateTypeInstance === undefined) {
            return
        }
        return fromNode(node, lookup.spec.generateTypeInstance(state))
    }

    return {
        atomGenerator(node, state, fixture) {
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
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateCall === undefined) {
                return
            }
            return lookup.spec.generateCall(node as any, state, fixture)
        },
        assignmentGenerator(node, state, fixture) {
            const lookup = tryLookupNamedNode(assignmentSpecMap, node.call.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateAssignment === undefined) {
                return
            }
            return lookup.spec.generateAssignment(node as any, state, fixture)
        },
        letCallGenerator(node, state, fixture) {
            const lookup = tryLookupNamedNode(letCallSpecMap, node.call.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateLetCall === undefined) {
                return
            }
            return lookup.spec.generateLetCall(node as any, state, fixture)
        },
        typeCallGenerator(node, state, fixture) {
            const lookup = tryLookupNamedNode(typeCallSpecMap, node.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateTypeCall === undefined) {
                return
            }
            return lookup.spec.generateTypeCall(node as any, state, fixture)
        },
        simpleTypeCallGenerator(node, state, fixture) {
            const lookup = tryLookupNamedNode(simpleTypeCallSpecMap, node.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateSimpleTypeCall === undefined) {
                return
            }
            return lookup.spec.generateSimpleTypeCall(node as any, state, fixture)
        },
    }
}

function tryLookupNamedNode(specMap: SpecMap, node: TreeNode) {
    if (node.type === "atom") {
        return lookupByName(specMap, [node.token])
    }
    if (node.type === "property-access") {
        const unwrapped = unwrapPropertyAccess(node)
        if (unwrapped !== undefined) {
            return lookupByName(specMap, unwrapped)
        }
    }
    return null
}

type PropertyPair = readonly [Token<typeof tMemberAccessOperator>, Token]
type UnwrappedPropertyAccess = readonly [Token, ...PropertyPair[]]

function unwrapPropertyAccess(propertyAccess: PropertyAccess): UnwrappedPropertyAccess | undefined {
    if (propertyAccess.base.type === "call") {
        return
    }
    if (propertyAccess.base.type === "property-access") {
        const baseUnwrapped = unwrapPropertyAccess(propertyAccess.base)
        if (baseUnwrapped === undefined) {
            return
        }
        return [
            ...baseUnwrapped,
            [propertyAccess.memberAccessOperatorToken, propertyAccess.property] as const
        ] as const
    }
    return [propertyAccess.base.token, [propertyAccess.memberAccessOperatorToken, propertyAccess.property]]
}

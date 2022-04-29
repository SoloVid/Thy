import assert from "assert";
import { Token } from "../tokenizer/token";
import { tMemberAccessOperator, tValueIdentifier } from "../tokenizer/token-type";
import type { PropertyAccess } from "../tree";
import type { Assignment } from "../tree/assignment";
import type { Atom } from "../tree/atom";
import type { Call } from "../tree/call";
import type { LetCall } from "../tree/let-call";
import { CodeGeneratorFunc, fromTokenRange, GeneratedSnippets } from "./generator";
import { GeneratorForGlobalParentSpec, GeneratorForGlobalSpec, isLeaf, isParent } from "./generator-for-global";
import type { GeneratorState } from "./generator-state";

export interface LibraryGeneratorCollection {
    atomGenerator: CodeGeneratorFunc<Atom>
    propertyAccessGenerator: CodeGeneratorFunc<PropertyAccess>
    callGenerator: CodeGeneratorFunc<Call>
    assignmentGenerator: CodeGeneratorFunc<Assignment>
    letCallGenerator: CodeGeneratorFunc<LetCall>
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
    identifierPartsUsed: number
}

function lookupByName(specMap: SpecMap, identifier: UnwrappedPropertyAccess): null | LookupResult {
    const names = [identifier[0], ...(identifier.slice(1) as readonly PropertyPair[]).map(p => p[1].text)]
    let currentMap = specMap
    let scopesUsed = 0
    for (const scope of identifier.scopes) {
        scopesUsed++
        if (scope.type !== 'atom') {
            return null
        }
        if (currentMap.has(scope.token.text)) {
            const inward = currentMap.get(scope.token.text)
            assert(inward)
            if (inward instanceof Map) {
                currentMap = inward
            } else {
                return {
                    spec: inward,
                    identifierPartsUsed: scopesUsed
                }
            }
        } else {
            return null
        }
    }
    if (currentMap.has(identifier.target.text)) {
        const found = currentMap.get(identifier.target.text)
        assert(found)
        return {
            spec: found,
            identifierPartsUsed: scopesUsed + 1
        }
    }
    return null
}

type FillOutPropertyAccessExpression = (trailingTokens: Token[]) => GeneratedSnippets
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

    return {
        valueGenerator(node, state) {
            if (node.target.type !== tValueIdentifier) {
                return
            }
            const valueIdentifier = node as Identifier<typeof tValueIdentifier>
            const lookup = lookupByName(valueSpecMap, valueIdentifier)
            if (lookup === null) {
                return
            }
            let partGeneratedNow: GeneratedSnippets
            if (lookup.spec instanceof Map) {
                partGeneratedNow = fromTokenRange(node, generateObject(lookup.spec, state))
            } else {
                partGeneratedNow = fromTokenRange(node, lookup.spec.generateValue(state))
            }
            
            if (lookup.identifierPartsUsed < node.scopes.length + 1) {
                return fillOutIdentifierExpression(valueIdentifier, partGeneratedNow, lookup.identifierPartsUsed)
            } else {
                return partGeneratedNow
            }
        },
        callGenerator(node, state, fixture) {
            if (node.func.type !== "identifier") {
                return
            }
            const lookup = lookupByName(callSpecMap, node.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateCall === undefined) {
                return
            }
            return lookup.spec.generateCall(node as any, state, fixture)
        },
        assignmentGenerator(node, state, fixture) {
            if (node.call.func.type !== "identifier") {
                return
            }
            const lookup = lookupByName(assignmentSpecMap, node.call.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateAssignment === undefined) {
                return
            }
            return lookup.spec.generateAssignment(node as any, state, fixture)
        },
        letCallGenerator(node, state, fixture) {
            if (node.call.func.type !== "identifier") {
                return
            }
            const lookup = lookupByName(letCallSpecMap, node.call.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateLetCall === undefined) {
                return
            }
            return lookup.spec.generateLetCall(node as any, state, fixture)
        }
    }
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

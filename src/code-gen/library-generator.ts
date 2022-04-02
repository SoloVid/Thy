import assert from "assert";
import { tValueIdentifier } from "../tokenizer/token-type";
import { Assignment } from "../tree/assignment";
import { Atom } from "../tree/atom";
import { Call } from "../tree/call";
import { Identifier } from "../tree/identifier";
import { LetCall } from "../tree/let-call";
import { CodeGeneratorFunc, fromTokenRange, GeneratedSnippets } from "./generator";
import { GeneratorForGlobalParentSpec, GeneratorForGlobalSpec, isParent } from "./generator-for-global";
import { GeneratorState } from "./generator-state";

export interface LibraryGeneratorCollection {
    valueGenerator: CodeGeneratorFunc<Identifier>
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
        } else if (requiredMethod in spec) {
            specMap.set(spec.name, spec)
        }
    }
    return specMap
}

interface LookupResult {
    spec: GeneratorForGlobalSpec | SpecMap
    identifierPartsUsed: number
}

function lookupByName(specMap: SpecMap, identifier: Identifier<typeof tValueIdentifier>): null | LookupResult {
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

type FillOutIdentifierExpression = (identifier: Identifier<typeof tValueIdentifier>, generated: GeneratedSnippets, partsUsed: number) => GeneratedSnippets
type GenerateObject = (hierarchy: SpecMap, state: GeneratorState) => string

interface Options {
    fillOutIdentifierExpression: FillOutIdentifierExpression,
    generateObject: GenerateObject
}

export function makeLibraryGenerators(
    specs: (GeneratorForGlobalSpec | GeneratorForGlobalParentSpec)[],
    { fillOutIdentifierExpression, generateObject }: Options,
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
            const lookup = lookupByName(callSpecMap, node.call.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateAssignment === undefined) {
                return
            }
            return lookup.spec.generateAssignment(node as any, state, fixture)
        },
        letCallGenerator(node, state, fixture) {
            if (node.call.func.type !== "identifier") {
                return
            }
            const lookup = lookupByName(callSpecMap, node.call.func)
            if (lookup === null || lookup.spec instanceof Map || lookup.spec.generateLetCall === undefined) {
                return
            }
            return lookup.spec.generateLetCall(node as any, state, fixture)
        }
    }
}
import { makeLibraryGenerators } from "../../../library-generator";
import { generateTsFromIdentifierRawTokens } from "../../generate-property-access-ts";
import { generateObjectFromHierarchy } from "../helpers/generate-object";
import { namespaceThyGenerator } from "./thy";

/**
 * Standard library for generating namespace-style TypeScript code.
 */
export const standardLibraryNamespace = makeLibraryGenerators([
    namespaceThyGenerator
], {
    // TODO: Share with core.
    fillOutIdentifierExpression(identifier, generated, partsUsed) {
        const remainingRawTokens = identifier.rawTokens.slice(partsUsed * 2)
        return [generated, generateTsFromIdentifierRawTokens(remainingRawTokens)]
    },
    generateObject: generateObjectFromHierarchy
}
)
import { makeLibraryGenerators } from "../../../library-generator";
import { generateTsFromIdentifierRawTokens } from "../../generate-identifier-ts";
import { castGenerator } from "./cast";
import { checkGenerator } from "./check";
import { defGenerator } from "./def";
import { generateObjectFromHierarchy } from "../helpers/generate-object";
import { ifGenerator } from "./if";
import { mathGenerator } from "./math";

/**
 * Standard library for core language functionality (e.g. control flow and math).
 */
export const standardLibraryCore = makeLibraryGenerators([
    castGenerator,
    checkGenerator,
    defGenerator,
    ifGenerator,
    mathGenerator,
], {
    fillOutIdentifierExpression(identifier, generated, partsUsed) {
        const remainingRawTokens = identifier.rawTokens.slice(partsUsed * 2)
        return [generated, generateTsFromIdentifierRawTokens(remainingRawTokens)]
    },
    generateObject: generateObjectFromHierarchy
}
)
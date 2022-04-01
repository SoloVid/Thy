import { makeLibraryGenerators } from "../../library-generator";
import { generateTsFromIdentifierRawTokens } from "../generate-identifier-ts";
import { castGenerator } from "./cast";
import { checkGenerator } from "./check";
import { generateObjectFromHierarchy } from "./helpers/generate-object";
import { mathGenerator } from "./math";

export const standardLibraryGenerators = makeLibraryGenerators([
    castGenerator,
    checkGenerator,
    mathGenerator,
], {
    fillOutIdentifierExpression(identifier, generated, partsUsed) {
        const remainingRawTokens = identifier.rawTokens.slice(partsUsed * 2)
        return [generated, generateTsFromIdentifierRawTokens(remainingRawTokens)]
    },
    generateObject: generateObjectFromHierarchy
}
)
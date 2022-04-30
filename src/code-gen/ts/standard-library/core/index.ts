import { makeLibraryGenerators } from "../../../library-generator";
import { fillOutPropertyAccessExpression } from "../../generate-property-access-ts";
import { generateObjectFromHierarchy } from "../helpers/generate-object";
import { castGenerator } from "./cast";
import { checkGenerator } from "./check";
import { defGenerator } from "./def";
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
    fillOutPropertyAccessExpression: fillOutPropertyAccessExpression,
    generateObject: generateObjectFromHierarchy
}
)
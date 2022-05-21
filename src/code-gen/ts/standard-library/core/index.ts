import { makeLibraryGenerators } from "../../../library-generator";
import { fillOutPropertyAccessExpression } from "../../generate-property-access-ts";
import { generateObjectFromHierarchy } from "../helpers/generate-object";
import { castGenerator } from "./cast";
import { checkGenerator } from "./check";
import { defGenerator } from "./def";
import { catchGenerator, consoleGenerator, elseGenerator, falseGenerator, finallyGenerator, nullGenerator, trueGenerator } from "./globals";
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

    consoleGenerator,
    falseGenerator,
    nullGenerator,
    trueGenerator,

    catchGenerator,
    elseGenerator,
    finallyGenerator,
], {
    fillOutPropertyAccessExpression: fillOutPropertyAccessExpression,
    generateObject: generateObjectFromHierarchy
}
)
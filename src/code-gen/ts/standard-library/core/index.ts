import { makeLibraryGenerators } from "../../../library-generator";
import { fillOutPropertyAccessExpression } from "../../generate-property-access-ts";
import { generateObjectFromHierarchy } from "../helpers/generate-object";
import { castGenerator } from "./cast";
import { checkGenerator } from "./check";
import { defGenerator } from "./def";
import { catchGenerator, consoleGenerator, elseGenerator, falseGenerator, finallyGenerator, nullGenerator, trueGenerator } from "./globals";
import { ifGenerator } from "./if";
import { mathGenerator } from "./math";
import { booleanTypeGenerator, numberTypeGenerator, stringTypeGenerator, unknownTypeGenerator, voidTypeGenerator } from "./primitive-types";
import { unionGenerator } from "./transform-types";

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

    booleanTypeGenerator,
    numberTypeGenerator,
    stringTypeGenerator,
    unknownTypeGenerator,
    voidTypeGenerator,

    unionGenerator,

    catchGenerator,
    elseGenerator,
    finallyGenerator,
], {
    fillOutPropertyAccessExpression: fillOutPropertyAccessExpression,
    generateObject: generateObjectFromHierarchy
}
)
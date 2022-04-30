import { makeLibraryGenerators } from "../../../library-generator";
import { fillOutPropertyAccessExpression } from "../../generate-property-access-ts";
import { generateObjectFromHierarchy } from "../helpers/generate-object";
import { namespaceThyGenerator } from "./thy";

/**
 * Standard library for generating namespace-style TypeScript code.
 */
export const standardLibraryNamespace = makeLibraryGenerators([
    namespaceThyGenerator
], {
    fillOutPropertyAccessExpression: fillOutPropertyAccessExpression,
    generateObject: generateObjectFromHierarchy
}
)
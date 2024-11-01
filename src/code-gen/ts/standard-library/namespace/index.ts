import { makeLibraryGenerators } from "../../library-generator"
import { generateObjectFromHierarchy } from "../helpers/generate-object"
import { namespaceThyGenerator } from "./thy"

/**
 * Standard library for generating namespace-style TypeScript code.
 */
export const standardLibraryNamespace = makeLibraryGenerators(
  [namespaceThyGenerator],
  {
    generateObject: generateObjectFromHierarchy,
  },
)

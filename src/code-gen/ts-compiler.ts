import { makeCompiler } from "../compiler";
import { aggregateLibrary } from "./library-generator";
import { tsGenerator } from "./ts/generate-ts";
import { standardLibraryCore } from "./ts/standard-library/core";
import { standardLibraryNamespace } from "./ts/standard-library/namespace";

export const tsCoreCompiler = makeCompiler(tsGenerator(standardLibraryCore))
export const tsNamespaceCompiler = makeCompiler(tsGenerator(aggregateLibrary([standardLibraryCore, standardLibraryNamespace])))

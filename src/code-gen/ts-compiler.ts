import { makeCompiler } from "../compiler";
import { tsGenerator } from "./ts/generate-ts";

export const tsCompiler = makeCompiler(tsGenerator)

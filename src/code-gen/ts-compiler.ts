import { makeCompiler } from "../compiler";
import { makeTokenizer } from "../tokenizer/tokenizer";
import { tsGenerator } from "./ts/generate-ts";

export const tsCompiler = makeCompiler(makeTokenizer, tsGenerator)

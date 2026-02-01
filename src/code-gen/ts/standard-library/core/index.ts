import { makeLibraryGenerators } from "../../library-generator.ts"
import { castGenerator } from "./cast.ts"
import { checkGenerator } from "./check.ts"
import { defGenerator } from "./def.ts"
import {
  catchGenerator,
  elseGenerator,
  falseGenerator,
  finallyGenerator,
  nullGenerator,
  trueGenerator,
} from "./globals.ts"
import { ifGenerator } from "./if.ts"
import { mathGenerator } from "./math.ts"
import {
  booleanTypeGenerator,
  numberTypeGenerator,
  stringTypeGenerator,
  unknownTypeGenerator,
  voidTypeGenerator,
} from "./primitive-types.ts"
import { printGenerator } from "./print.ts"
import { stringGenerator } from "./string.ts"
import { intersectionGenerator, unionGenerator } from "./transform-types.ts"

/**
 * Standard library for core language functionality (e.g. control flow and math).
 */
export const standardLibraryCore = makeLibraryGenerators([
  castGenerator,
  checkGenerator,
  defGenerator,
  ifGenerator,
  mathGenerator,
  printGenerator,
  stringGenerator,

  falseGenerator,
  nullGenerator,
  trueGenerator,

  booleanTypeGenerator,
  numberTypeGenerator,
  stringTypeGenerator,
  unknownTypeGenerator,
  voidTypeGenerator,

  intersectionGenerator,
  unionGenerator,

  catchGenerator,
  elseGenerator,
  finallyGenerator,
])

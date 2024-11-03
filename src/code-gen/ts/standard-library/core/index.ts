import { makeLibraryGenerators } from "../../library-generator"
import { castGenerator } from "./cast"
import { checkGenerator } from "./check"
import { defGenerator } from "./def"
import {
  catchGenerator,
  elseGenerator,
  falseGenerator,
  finallyGenerator,
  nullGenerator,
  trueGenerator,
} from "./globals"
import { ifGenerator } from "./if"
import { mathGenerator } from "./math"
import {
  booleanTypeGenerator,
  numberTypeGenerator,
  stringTypeGenerator,
  unknownTypeGenerator,
  voidTypeGenerator,
} from "./primitive-types"
import { printGenerator } from "./print"
import { intersectionGenerator, unionGenerator } from "./transform-types"

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

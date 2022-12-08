import { castBuiltin } from "./cast";
import { check } from "./check";
import { defBuiltin } from "./def";
import { falseBuiltin, nullBuiltin, trueBuiltin } from "./globals";
import { ifBuiltin } from "./if";
import { loopBuiltin } from "./loop";
import { printBuiltin } from "./print";

export const core = {
  "cast": castBuiltin,
  "check": check,
  "def": defBuiltin,
  "if": ifBuiltin,
  "loop": loopBuiltin,
  "print": printBuiltin,

  "true": trueBuiltin,
  "false": falseBuiltin,
  "null": nullBuiltin,
}

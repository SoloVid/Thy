import { arrayBuiltin, mutableArrayBuiltin } from "./array";
import { castBuiltin } from "./cast";
import { check } from "./check";
import { defBuiltin } from "./def";
import { falseBuiltin, nullBuiltin, trueBuiltin } from "./globals";
import { ifBuiltin } from "./if";
import { json } from "./json";
import { loopElementsBuiltin, loopForeverBuiltin, loopTimesBuiltin } from "./loop";
import { loopAsyncElementsBuiltin, loopAsyncForeverBuiltin, loopAsyncTimesBuiltin } from "./loop-async";
import { mutableMapBuiltin } from "./map";
import { math } from "./math";
import { printBuiltin } from "./print";
import { regexBuiltin } from "./regex";

export const core = {
  "array": arrayBuiltin,
  "arrayMutable": mutableArrayBuiltin,
  "cast": castBuiltin,
  "check": check,
  "def": defBuiltin,
  "if": ifBuiltin,
  "json": json,
  "loop": {
    "forever": loopForeverBuiltin,
    "times": loopTimesBuiltin,
    "elements": loopElementsBuiltin,
    "async": {
      "forever": loopAsyncForeverBuiltin,
      "times": loopAsyncTimesBuiltin,
      "elements": loopAsyncElementsBuiltin,
    }
  },
  "map": mutableMapBuiltin,
  "math": math,
  "print": printBuiltin,
  "regex": regexBuiltin,

  "true": trueBuiltin,
  "false": falseBuiltin,
  "null": nullBuiltin,
}

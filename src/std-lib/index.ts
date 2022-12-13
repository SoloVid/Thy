import { arrayBuiltin, mutableArrayBuiltin } from "./array";
import { castBuiltin } from "./cast";
import { check } from "./check";
import { defBuiltin } from "./def";
import { falseBuiltin, nullBuiltin, trueBuiltin } from "./globals";
import { ifBuiltin } from "./if";
import { loopElementsBuiltin, loopForeverBuiltin, loopTimesBuiltin } from "./loop";
import { loopAsyncElementsBuiltin, loopAsyncForeverBuiltin, loopAsyncTimesBuiltin } from "./loop-async";
import { math } from "./math";
import { printBuiltin } from "./print";

export const core = {
  "array": arrayBuiltin,
  "arrayMutable": mutableArrayBuiltin,
  "cast": castBuiltin,
  "check": check,
  "def": defBuiltin,
  "if": ifBuiltin,
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
  "math": math,
  "print": printBuiltin,

  "true": trueBuiltin,
  "false": falseBuiltin,
  "null": nullBuiltin,
}

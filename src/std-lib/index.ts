import { arrayBuiltin, getBuiltin, mutableArrayBuiltin, setBuiltin } from "./array";
import { castBuiltin } from "./cast";
import { check } from "./check";
import { defBuiltin } from "./def";
import { delayBuiltin } from "./delay";
import { elseBuiltin, falseBuiltin, nullBuiltin, trueBuiltin } from "./globals";
import { ifBuiltin } from "./if";
import { json } from "./json";
import { loopElementsBuiltin, loopForeverBuiltin, loopTimesBuiltin } from "./loop";
import { loopAsyncElementsBuiltin, loopAsyncForeverBuiltin, loopAsyncTimesBuiltin } from "./loop-async";
import { mutableMapBuiltin } from "./map";
import { math } from "./math";
import { printBuiltin } from "./print";
import { regexBuiltin } from "./regex";
import { stringBuiltin } from "./string";
import { switchBuiltin } from "./switch";

export const core = {
  "array": arrayBuiltin,
  "arrayMutable": mutableArrayBuiltin,
  "get": getBuiltin,
  "set": setBuiltin,
  "cast": castBuiltin,
  "check": check,
  "def": defBuiltin,
  "delay": delayBuiltin,
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
  "string": stringBuiltin,
  "switch": switchBuiltin,

  "true": trueBuiltin,
  "false": falseBuiltin,
  "null": nullBuiltin,

  "else": elseBuiltin,
}

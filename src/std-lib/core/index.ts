import { arrayBuiltin, getBuiltin, setBuiltin, tupleBuiltin } from "./array.ts"
import { castBuiltin } from "./cast.ts"
import { check } from "./check.ts"
import { defBuiltin } from "./def.ts"
import { delayBuiltin } from "./delay.ts"
import { doBuiltin } from "./do.ts"
import {
  catchBuiltin,
  elseBuiltin,
  falseBuiltin,
  finallyBuiltin,
  nullBuiltin,
  trueBuiltin,
} from "./globals.ts"
import { ifBuiltin } from "./if.ts"
import { intersectionBuiltin } from "./intersection.ts"
import { json } from "./json.ts"
import {
  loopElementsBuiltin,
  loopForeverBuiltin,
  loopTimesBuiltin,
} from "./loop.ts"
import {
  loopAsyncElementsBuiltin,
  loopAsyncForeverBuiltin,
  loopAsyncTimesBuiltin,
} from "./loop-async.ts"
import { mutableMapBuiltin } from "./map.ts"
import { math } from "./math.ts"
import { numberBuiltin } from "./number.ts"
import { printBuiltin } from "./print.ts"
import { regexBuiltin } from "./regex.ts"
import { stringBuiltin } from "./string.ts"
import { switchBuiltin } from "./switch.ts"
import { throwBuiltin, tryBuiltin } from "./throw-try-catch.ts"
import { unionBuiltin } from "./union.ts"

export const core = {
  tuple: tupleBuiltin,
  array: arrayBuiltin,
  get: getBuiltin,
  set: setBuiltin,
  cast: castBuiltin,
  check: check,
  def: defBuiltin,
  delay: delayBuiltin,
  do: doBuiltin,
  if: ifBuiltin,
  json: json,
  loop: {
    forever: loopForeverBuiltin,
    times: loopTimesBuiltin,
    elements: loopElementsBuiltin,
    async: {
      forever: loopAsyncForeverBuiltin,
      times: loopAsyncTimesBuiltin,
      elements: loopAsyncElementsBuiltin,
    },
  },
  map: mutableMapBuiltin,
  math: math,
  number: numberBuiltin,
  print: printBuiltin,
  regex: regexBuiltin,
  string: stringBuiltin,
  switch: switchBuiltin,
  throw: throwBuiltin,
  try: tryBuiltin,

  true: trueBuiltin,
  false: falseBuiltin,
  null: nullBuiltin,

  catch: catchBuiltin,
  else: elseBuiltin,
  finally: finallyBuiltin,

  All: intersectionBuiltin,
  Some: unionBuiltin,
}

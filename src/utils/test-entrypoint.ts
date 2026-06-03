/// <reference lib="deno.ns" />
import { testBackend } from "@/utils/test-entrypoint-config.ts"
import {
  test as utsTest
} from "under-the-sun"

export function test(
  description: string,
  exercise: () => void | PromiseLike<void>,
) {
  switch (testBackend) {
    case "deno":
      Deno.test(description, async () => exercise())
      break
    case "uts":
      utsTest(description, exercise)
      break
    default:
      throw new Error(`Unknown test backend: ${testBackend}`)
  }
}

export function defineTestGroup(groupDescriptionPrefix: string) {
  return function groupTest(
    description: string,
    exercise: () => void | PromiseLike<void>,
  ) {
    test(groupDescriptionPrefix + description, exercise)
  }
}

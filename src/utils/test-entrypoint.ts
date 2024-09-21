import { test as utsTest, defineTestGroup as utsDefineTestGroup } from "under-the-sun"

// function test(
//   description: string,
//   exercise: () => void | PromiseLike<void>,
// ) {
//   utsTest(description, exercise)
// }

// export function defineTestGroup(groupDescriptionPrefix: string) {
//   return function groupTest(
//     description: string,
//     exercise: () => void | PromiseLike<void>,
//   ) {
//     test(groupDescriptionPrefix + description, exercise)
//   }
// }

import { describe, it as mochaTest } from "mocha"

function mochaDefineTestGroup(groupDescriptionPrefix: string) {
  return function groupTest(
    description: string,
    exercise: () => void | PromiseLike<void>,
  ) {
    describe(groupDescriptionPrefix, () => {
      mochaTest(description, exercise)
    })
  }
}

const useMocha = !!process?.env?.MOCHA || !!process?.env?.WALLABY

export const test = useMocha ? mochaTest : utsTest
export const defineTestGroup = useMocha ? mochaDefineTestGroup : utsDefineTestGroup

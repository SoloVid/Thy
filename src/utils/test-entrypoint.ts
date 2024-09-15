// import { test as utsTest } from "under-the-sun"
import { describe, it, suite, test as mochaTest } from "mocha"

// export function test(description: string, exercise: () => void | PromiseLike<void>) {
//   utsTest(description, exercise)
// }

// export function defineTestGroup(groupDescriptionPrefix: string) {
//   return function groupTest(description: string, exercise: () => void | PromiseLike<void>) {
//     test(groupDescriptionPrefix + description, exercise)
//   }
// }

export function test(
  description: string,
  exercise: () => void | PromiseLike<void>,
) {
  // mochaTest(description, exercise)
  it(description, exercise)
}

export function defineTestGroup(groupDescriptionPrefix: string) {
  return function groupTest(
    description: string,
    exercise: () => void | PromiseLike<void>,
  ) {
    // suite(groupDescriptionPrefix)
    // mochaTest(description, exercise)
    describe(groupDescriptionPrefix, () => {
      it(description, exercise)
    })
  }
}

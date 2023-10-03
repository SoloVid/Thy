import assert from "assert";
import { test } from "under-the-sun";
import { permute } from "./permute";

test("permute()", async () => {
  const permutations = permute([1, 2, 3])
  const permutationStrings = permutations.map(a => a.join(""))
  const sortedPermutationStrings = permutationStrings.sort()
  assert.deepStrictEqual(sortedPermutationStrings, ["123", "132", "213", "231", "312", "321"])
})

import assert from "node:assert"
import { test } from "under-the-sun"
import { splitThyStatements } from "./split-statements"

test("splitThyStatements() should split line into parts", async () => {
  const inputLines = [
    "a b c",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", "b", "c"],
  ])
})

test("splitThyStatements() should split line into parts of complex formats", async () => {
  const inputLines = [
    `a.b.c -148.0 "himom"`,
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    [`a.b.c`, `-148.0`, `"himom"`],
  ])
})

test("splitThyStatements() should return unaltered array for flat block of calls", async () => {
  const inputLines = [
    "a",
    "b",
    "c",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a"],
    ["b"],
    ["c"],
  ])
})

test("splitThyStatements() should collapse nested block into parent statement parts", async () => {
  const inputLines = [
    "a",
    "  b",
    "  c",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "  b",
      "  c",
    ]]
  ])
})

test("splitThyStatements() should reject `and` without a preceding statement", async () => {
  const inputLines = [
    "and a",
  ]
  assert.throws(() => splitThyStatements(inputLines), /No preceding statement for `and`/)
})

test("splitThyStatements() should treat `and` arguments as part of preceding statement", async () => {
  const inputLines = [
    "a",
    "  b",
    "and c d",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "  b",
    ], "c", "d"]
  ])
})

test("splitThyStatements() should support `and` with multiple blocks", async () => {
  const inputLines = [
    "a",
    "  b",
    "and c d",
    "  e",
    "and",
    "  f",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "  b",
    ], "c", "d", [
      "  e",
    ], [
      "  f",
    ]]
  ])
})

test("splitThyStatements() should collapse layers of nested block into parent statement parts", async () => {
  const inputLines = [
    "a",
    "  b",
    "    c",
    "    d",
    "  e",
    "    f",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "  b",
      "    c",
      "    d",
      "  e",
      "    f",
    ]]
  ])
})

test("splitThyStatements() can handle parallel nested blocks", async () => {
  const inputLines = [
    "a",
    "  b",
    "c",
    "  d",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "  b",
    ]],
    ["c", [
      "  d",
    ]],
  ])
})

test("splitThyStatements() should consider first indent (all indented already case)", async () => {
  const inputLines = [
    "  a",
    "    b",
    "  c",
    "    d",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "    b",
    ]],
    ["c", [
      "    d",
    ]],
  ])
})

test("splitThyStatements() should fail on bad outdent", async () => {
  const inputLines = [
    "    a",
    "  b",
  ]
  assert.throws(() => splitThyStatements(inputLines), /does not match any preceding indentation level/)
})

test("splitThyStatements() should discard empty lines", async () => {
  const inputLines = [
    "  ",
    "a",
    "",
    "    ",
    "b",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a"],
    ["b"],
  ])
})

test("splitThyStatements() should discard comment lines (single line)", async () => {
  const inputLines = [
    "This is a comment",
    "a",
    "Another",
    "Third",
    "b",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    [],
    ["a"],
    [],
    [],
    ["b"],
  ])
})

test("splitThyStatements() should detect empty block from comment", async () => {
  const inputLines = [
    "a",
    "  Empty block",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "  Empty block",
    ]]
  ])
})

test("splitThyStatements() should discard multi-line comments", async () => {
  const inputLines = [
    "COMMENT",
    "a",
    "  b",
    "COMMENT",
    "c",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    [],
    [],
    [],
    [],
    ["c"],
  ])
})

test("splitThyStatements() should detect empty block from multi-line comment", async () => {
  const inputLines = [
    "a",
    "  XXX",
    "  b",
    "  XXX",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["a", [
      "  XXX",
      "  b",
      "  XXX",
    ]]
  ])
})

test("splitThyStatements() should collapse multiline string", async () => {
  const inputLines = [
    `f """`,
    ``,
    `  Dear so-and-so,`,
    ``,
    `  This letter...`,
    ``,
    `g`,
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["f", `"\\nDear so-and-so,\\n\\nThis letter..."`],
    ["g"],
  ])
})

test("splitThyStatements() should track indent level", async () => {
  const inputLines = [
    `  f """`,
    ``,
    `    himom`,
    ``,
    `  g`,
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["f", `"\\nhimom"`],
    ["g"],
  ])
})

test("splitThyStatements() should allow multiple multiline strings", async () => {
  const inputLines = [
    `f """`,
    `  one`,
    `f """`,
    `  two`,
    `and """`,
    `  three`,
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines), [
    ["f", `"one"`],
    ["f", `"two"`, `"three"`],
  ])
})

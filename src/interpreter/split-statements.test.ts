import assert from "node:assert"
import { test } from "under-the-sun"
import { splitThyStatements } from "./split-statements"
import type { AtomSingle } from "./types"

type AtomJustString = string | BlockJustString
type StatementJustStrings = readonly AtomJustString[]
type BlockJustString = readonly string[]

function splitThyStatementsBasic(thySourceLines: readonly string[]): readonly StatementJustStrings[] {
  return splitThyStatements(thySourceLines, 0).map(s => s.map(p => {
    if ("lines" in p) {
      return p.lines
    }
    return (p as AtomSingle).text
  }))
}

test("splitThyStatements() should split line into parts", async () => {
  const inputLines = [
    "a b c",
  ]
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
    ["a", "b", "c"],
  ])
})

test("splitThyStatements() should split line into parts of complex formats", async () => {
  const inputLines = [
    `a.b.c -148.0 "himom"`,
  ]
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
    [`a.b.c`, `-148.0`, `"himom"`],
  ])
})

test("splitThyStatements() should return unaltered array for flat block of calls", async () => {
  const inputLines = [
    "a",
    "b",
    "c",
  ]
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
    ["a", [
      "  b",
      "  c",
    ]]
  ])
})

test("splitThyStatements() should provide location information", async () => {
  const inputLines = [
    "a aa",
    "  b",
    "c",
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines, 5), [
    [
      { text: "a", lineIndex: 5, columnIndex: 0 },
      { text: "aa", lineIndex: 5, columnIndex: 2 },
      { lines: ["  b"], lineIndex: 6 },
    ],
    [{ text: "c", lineIndex: 7, columnIndex: 0 }]
  ])
})

test("splitThyStatements() should reject `and` without a preceding statement", async () => {
  const inputLines = [
    "and a",
  ]
  assert.throws(() => splitThyStatementsBasic(inputLines), /No preceding statement for `and`/)
})

test("splitThyStatements() should treat `and` arguments as part of preceding statement", async () => {
  const inputLines = [
    "a",
    "  b",
    "and c d",
  ]
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.throws(() => splitThyStatementsBasic(inputLines), /does not match any preceding indentation level/)
})

test("splitThyStatements() should discard empty lines", async () => {
  const inputLines = [
    "  ",
    "a",
    "",
    "    ",
    "b",
  ]
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
    ["f", `"\\nDear so-and-so,\\n\\nThis letter..."`],
    ["g"],
  ])
})

test("splitThyStatements() provide location information for multiline string", async () => {
  const inputLines = [
    `f """`,
    ``,
    `  Dear so-and-so,`,
    ``,
    `  This letter...`,
    ``,
    `g`,
  ]
  assert.deepStrictEqual(splitThyStatements(inputLines, 5), [
    [
      { text: "f", lineIndex: 5, columnIndex: 0 },
      { text: `"\\nDear so-and-so,\\n\\nThis letter..."`, lineIndex: 5, columnIndex: 2 }
    ],
    [{ text: "g", lineIndex: 11, columnIndex: 0 }],
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
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
  assert.deepStrictEqual(splitThyStatementsBasic(inputLines), [
    ["f", `"one"`],
    ["f", `"two"`, `"three"`],
  ])
})

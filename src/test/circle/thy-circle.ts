
const blocks = [a, b] as const

// function makeThy() {

// }

// const thy = makeThy()
function thy<Key extends ("a" | "b")>(key: Key) {
  return null as unknown as Key extends "a" ? "A" : "AB"
}

type Thy = typeof thy
// type Thy = <Key extends ("a" | "b")>(key: Key) => Key extends "a" ? "A" : "AB"

function a() {
  return { a: "A" as const }
}

function b({ thy }: { thy: Thy }) {
  const a = thy("a")
  return { b: `${a}B` as const }
}

const aTest: "A" = thy("a")
const bTest: "AB" = thy("b")

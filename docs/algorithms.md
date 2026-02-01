# Algorithms - Thy (lang)

This page provides some example algorithms as implemented
in TypeScript and in Thy.

## Baklava

This example program
(called [Baklava](https://sampleprograms.io/projects/baklava/))
demonstrates basic looping and printing, as well as using JavaScript
functionality (`.repeat()` in this case).

```typescript
for (var i = 0; i < 10; i++) {
  console.log(" ".repeat(10 - i) + "*".repeat(i * 2 + 1))
}

for (var i = 10; -1 < i; i--) {
  console.log(" ".repeat(10 - i) + "*".repeat(i * 2 + 1))
}
```

vs.

```thy
space is def " "
star is def "*"

printLine is def
  i is given

  math.subtract 10 i
  spaces is space.repeat that

  math.multiply i 2
  math.add that 1
  stars is star.repeat that

  print ".spaces..stars."

loop.times 10
  private i is given
  printLine i

loop.times 11
  private i is given
  math.subtract 10 i
  printLine that
```

## Josephus Problem

The [Josephus Problem](https://sampleprograms.io/projects/josephus-problem/)
demonstrates a recursive algorithm.

```typescript
const josephus = (n, k) => {
  if (n == 1) return 1
  else return ((josephus(n - 1, k) + k - 1) % n) + 1
}

console.log(josephus(8, 13))
console.log(josephus(9, 14))
```

vs.

```thy
josephus is def
  n is given
  k is given
  check.equal n 1
  let if that
    return 1
  and else
    From ((josephus(n - 1, k) + k - 1) % n) + 1
    math.subtract n 1
    josephus that k
    math.subtract k 1
    math.add beforeThat that
    math.mod that n
    math.add that 1
    return that

josephus 8 13
print that
josephus 9 14
return that
```

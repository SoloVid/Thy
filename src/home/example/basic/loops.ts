
export const loopsTs = `
for (let i = 0; i < 10; i++) {
  console.log(i)
}
for (const e of arr) {
  console.log(e)
}
while (a < b) {
  console.log("still going")
}
`

export const loopsThy = `
loop.times 10
  private i is given
  print i
loop.elements arr
  private e is given
  print e
loop.forever
  check.asc a b
  check.not that
  let if that
    return null
  print "still going"
`

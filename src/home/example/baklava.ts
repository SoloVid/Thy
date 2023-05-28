// From https://sampleprograms.io/projects/baklava/javascript/

export const baklavaThy = `
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
`

export const baklavaJs = `
for (var i = 0; i < 10; i++)
    console.log (
        " ".repeat (10 - i) + "*".repeat (i * 2 + 1)
    );

for (var i = 10; -1 < i; i--)
    console.log (
        " ".repeat (10 - i) + "*".repeat (i * 2 + 1)
    );
`

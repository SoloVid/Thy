export const fizzBuzzThy = `
From https://code.golf/fizz-buzz
Define function and store in new variable
fizzBuzz is def
  This function takes one parameter "iterations"
  iterations is given

  loop.times iterations
    This lambda takes one parameter "i"
    Argument provided by the loop.times function
    private i is given

    private n is math.add i 1
    Compute n % 3
    math.mod n 3
    Compare the last result to 0
    check.equal that 0
    if that
      print "fizz"
    and else
      math.mod n 5
      check.equal that 0
      if that
        print "buzz"
      and else
        print n

Run the fizzBuzz function
print "== case 10 =="
fizzBuzz 10
print "== case 100 =="
fizzBuzz 100
`

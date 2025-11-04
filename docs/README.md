# Thy (lang)

Thy is a programming language that is
**simple** enough to _program on your phone_,
**powerful** enough to _integrate with TypeScript_,
and **familiar** enough to _not alienate developers_.

[To the Playground!](/play/)

Here are Thy's core design goals:

- No special characters (mobile friendly)
- TypeScript interoperability
- Natural (relative to mainstream programming)
- Strong static types
- Simple compiler
- Simple rules
- Encourage good programming practices
- Concise (not extremely verbose)

#### Where to?

- [I know TypeScript. I want to compare.](./vs-typescript.md)
- [Explain Thy to me like I've never programmed before.](./programming-101.md)
- [I need to see some actual algorithms.](./algorithms.md)
- [Show me the spec.](./language-spec.md)
- [Grant, please ramble about language design minutia.](./misc-notes.md)

#### So what does it look like?

```thy
From https://code.golf/fizz-buzz
Define function and store in new variable
fizzBuzz is def
  This function takes one parameter "iterations"
  iterations is given Number

  loop.times iterations
    This lambda takes one parameter "i"
    Argument provided by the loop.times function
    i is given

    n is math.add i 1
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
    let

Run the fizzBuzz function
print "== case 10 =="
fizzBuzz 10
print "== case 100 =="
fizzBuzz 100
```

And...an obligatory "Hello World" program:

```thy
print "himom"
```

#### Why should I use Thy?

You shouldn't.

I have a grand vision for building out a fully functional game
development ecosystem with Thy as part of it.
But until those tools are developed, Thy is only really useful
for self-contained small problems like
[Advent of Code](https://adventofcode.com)
or writing out notional code on your phone as a sort of shorthand.

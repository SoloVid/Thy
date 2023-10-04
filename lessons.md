## Imperative Programming 101

Let's jump right in with our first Thy **program**:

```thy
print "Hello there!"
```

This **program** just prints the text `Hello there!` to the screen.

`print` is a **function** (we'll talk about these a lot more later).
`"Hello there!"` is a **string** **literal**.
A **string** is a sequence of characters, in this case the 12-character sequence `Hello there!`.
Most languages denote strings with quotation marks (e.g. `"Hello there!"`), but in Thy we use periods.

**Programs** can have more than one **statement** (a line in Thy).
Multiple **statements** within a **program** will execute in the order they are written.

```thy
print "The sum of 5 and 3.5 is:"
print 8.5
```

This time we have two **statements**, the first one printing the **string** `The sum of 5 and 3.5 is:`
and the second printing the **number** `8.5`.

### Bonus: Comments

There are two kinds of lines in Thy that don't do anything:
blank lines and lines starting with a capital letter (i.e. **comments**).

```thy
Say hello
print "Hello there, beautiful!"

Inquire about dinner
print "Doing anything tonight?"
```

In this example, lines 1, 3, and 4 do not do anything, but the other two lines print text to the screen.

### Summary

- A **program** is a series of **statements** for the computer to execute in order.
- In Thy, each **statement** is on its own line, but some lines don't do anything.

You're now a programmer! There's still a lot more to learn, but you're off to a great start!

## Variables

Often, it is useful to store **values** in **variables** to reference later.

```thy
message is def "Hello there! I'm a really really really really looooonnnnnnggg message!"
print message
print message
```

The `message is` part creates a **variable** called `message` and assigns it the **value** to the right.
(`is` is our first Thy **keyword**.)
So after line 1, `message` (a name we made up) holds the **string** `Hello there! (etc)`.
Instead of using the **string** _literal_ `"Hello there! (etc)"` (notice the periods) with `print`,
we are instead using the **variable** `message` (notice no periods) which holds the same **string** **value**.

The **program** prints the message once on line 2 and again on line 3.

### Types

Every **variable** has a particular **type**.
Our first example variable (`message`) had the **type** **`String`**,
but there are many other **types** in Thy.
Here are a couple more basic **types** you'll encounter in Thy:

```thy
a is def 1
b is def 2.5
isBGreaterThanA is def true
isBEqualToA is def false
```

In this example, the **variables** `a` and `b` both have the **type** **`Number`**,
and the **variables** `isBGreaterThanA` and `isBEqualToA` both have the **type** **`Bool`** (true/false).

We'll talk more about **types** later.

### Summary

- **Variables** hold **values**.
- Every **variable** has a **type**.

## Calling Functions

We've already silently introduced you to **functions** (`print` and `def`),
but we haven't really described what they are yet.

A **function** is a **value** which represents code written somewhere else.
When we **call** the `print` **function**, we are running code written somewhere else
that prints values to the screen.

```thy
print "Hello there!"
```

In this simple example, we are **calling** the **function** called `print`,
and we are **passing** one **argument** `"Hello there!"` as we **call** it.

But there are many functions that do different things and may receive multiple **arguments**.
For example, the `math.add` **function** takes two **arguments** (`a` and `b` in this example) and adds them together:

```thy
a is def 1
b is def 2.5
math.add a b
```

So how do we use the sum of `a` and `b` calculated in the previous example?
We need to store the **return** value of the **function** **call**.
Most **functions** **return** a **value**.

```thy
a is def 1
b is def 2.5
sum is math.add a b
print sum
```

Notice that we added `sum is` before the `math.add` **call**,
so we are able to create a **variable** named `sum` which will hold
the **value** **returned** from `math.call` after `math.add a b` finishes.
Now that we have the **value** held in `sum`, we can print it on line 4.

Here are a couple more examples for good measure:

```thy
a is def 1
b is def 2.5
product is math.multiply a b
print product
```

The **program** above calculates the product of `1` and `2.5`, and it prints the result to the screen.

```thy
greeting is def "Heya, "
name is def "Joe"
message is string.concat greeting name
Prints "Heya, Joe"
print message
```

The **program** above prints `Heya, Joe` to the screen.
"Concatenate" is a fancy word (but you'll see it a lot) that means put together.

### That in Thy

Thy has a special **keyword** `that` which holds the value **returned**
by the **function** **called** in the immediately preceding **statement**.

We could rewrite the previous two **programs** a little more simply with `that`:

```thy
a is def 1
b is def 2.5
math.multiply a b
print that

greeting is def "Heya, "
name is def "Joe"
string.concat greeting name
print that
```

Notice that we did not store the **return** **value** of
`math.multiply` on line 3 or `string.concat` on line 8
but instead used `that` in the subsequent lines (4 and 9) to use the **value**.

`that` is a very handy tool to mitigate some of the limitations of Thy,
but **use it with care** as naming **values** with **variables** can make your **program** easier to understand.

### Summary

- A **function** is code written somewhere else.
- You can **call** a **function** with **arguments** to run that code.
- A **function** may **return** a **value** you can store in a **variable**.

## Writing Functions

In the last lesson, we described a **function** as code written elsewhere.
That ought to spark your curiosity to wonder, "Can I write my own function?"
Yes! You can write your own function.

### Simple Function

Let's start with a simple one:

```thy
Define our function.
printHi is def
  print "Hi!"

Call our function.
printHi
```

On lines 2 and 3, we **define** our **function**.
On line 6, we **call** that **function** (with no **arguments**).

Notice that our **function** is **defined** with an indented (two spaces) **block** of code.
We can put as many lines as we would like inside our **function**:

```thy
printStuff is def
  print "Hi!"
  print "I'm a computer"

  Blank lines and comments are still fine in here
  print "Are you?"

printStuff
```

The important part is that a **block** of code ends when the indentation decreases again.

### Function with Parameters

In the last lesson, we talked about **functions** receiving **arguments**.
How do we receive **arguments** in our own **function**?
By specifying **parameters** in our **function**!

> What's the difference between an **argument** and a **parameter**?
> You may hear these terms used interchangeably, but the difference is that 
> the **arguments** are the **values** **passed** in when the **function** is **called** and
> the **parameters** are the corresponding **variables** within the **function** **definition**.

Let's **define** a **function** which greets someone by name:

```thy
greet is def
  name is given String
  message is string.concat "Hello there, " name
  print message

Call the function. Prints "Hello there, Norm"
greet "Norm"
```

The new line here is `name is given String`.
This line says that our **function** has a **parameter** named `name` which will have the **type** `String`.
Once we have specified a **parameter** like this, we can use it as we would use any other **variable**.
In this case, we've **passed** `name` as the second **argument** to `string.concat`
to build the **string** we want to print.

What if we want to receive multiple **parameters**?

```thy
greet is def
  name is given String
  extraMessage is given String
  message is string.concat "Hello there, " name
  print message
  print extraMessage

Call the function. Prints "Hello there, Keith" then "Change your name! It's not scary!"
greet "Keith" "Change your name! It's not scary!"
```

This is the first time we've used **types** (`String` here) explicitly in the code itself.
We'll talk about **types** in depth later.
For now, know that `Number` and `Bool` are two other **types** we'll be using in the near future.

### Function with Return

In the last lesson, we talked about **functions** **returning** **values**.
To **return** a **value** from your own **function**, use the `return` **keyword** (not **function**):

```thy
getFavoriteNumber is def
  return 5

fav is getFavoriteNumber
print fav
```

### Putting It All Together

To put all this together, let's write a **function** that calculates the length of the hypotenuse
of a right triangle using the Pythagorean Theorem.

```thy
calcHypotenuse is def
  a is given Number
  b is given Number
  a2 is math.multiply a a
  b2 is math.multiply b b
  math.add a2 b2
  math.sqrt that
  return that

h is calcHypotenuse 3 4
print h
```

### Summary

You should have learned how to write your own **function** in Thy.

## Functions as Values

Remember how I said that a **function** is a **value**?
Maybe not, but this is a really important concept!
A **function** is a **value** just like a **string** or a **number**--it just has a different **type**.

### Named Functions

Take a crack at guessing what this example program does before reading the subsequent breakdown.

```thy
This is one of our early example functions.
printHi is def
  print "Hi!"

stammer is def
  sayMessage is given Function
  print "ummmm"
  sayMessage
  print "uhhhh"

stammer printHi
```

On lines 1 through 3, we define the **function** `printHi` that we wrote in the last lesson.

On lines 5 through 9, we define another **function** `stammer` that has one **parameter** `sayMessage`.
Unlike the `greet` function we wrote in the last lesson, this **parameter** has the **type** `Function`.
Lines 7 and 9 are simple print statements.
But on line 8, rather than **calling** `print` with some **argument**,
we instead **call** `sayMessage` (our **parameter**) itself.
So what does `sayMessage` do? We don't know.
It depends on what **value** is **passed** when the **function** is **called**.

On line 11, we **call** `stammer`, **passing** `printHi` as the one **argument**.
Now we know what `sayMessage` is! But only for this particular **call** of `stammer`.

Here is pretty much the same example **program**, but with multiple **parameters**:

```thy
This is one of our early example functions.
printHi is def
  print "Hi!"
printNope is def
  print "nope"

stammer is def
  sayMessage is given Function
  randomNumber is given Number
  sayMessage2 is given Function
  print "ummmm"
  sayMessage
  print "uhhhh"
  print randomNumber
  sayMessage2
  print "yeah"

stammer printHi 5 printNope
stammer printNope 1 printNope
```

### Calling Non-Functions 

You may be wondering, "If I can pass functions like other variables, can I call other variables like functions?"
What even is the difference between a **function** and some other **value**?
For example, we could try to close out the last example program with a line like this:

```thy
stammer 1 2 3
```

When `stammer` code would run, it would try to **call** `1` and `3` as **functions**.
The idea of this is OK and consistent on one level, but it would ultimately fail because `1` and `3` do not have the **type** `Function`.

A more raw incorrect example would be the following:

```thy
1 2 3
```

This **statement** means, "Call the function `1` with the two arguments `2` and `3`."
_Since `1` is a **number** **literal**, this code is trying to **call** `1` the number as a **function**, not some **function** named `1`._

Again, the only reason these two example wouldn't work is that `1` is a number and not a **function**.

### Blocks (Lambdas / Anonymous Functions)

In the first section, we **passed** **functions** by name to the `stammer` **function**,
but we can also **pass** **functions** without names as **arguments**.
In Thy, we'll typically refer to these as just **blocks**,
but they are more commonly called **lambdas** or **anonymous functions** in other languages.

Before diving in, note that a **block** is a **literal** **value**
like a **string** **literal** (e.g. `"Hi there!"`) or a **number** **literal** (e.g. `3.14`).

```thy
stammer is def
  sayMessage is given Function
  print "ummmm"
  sayMessage
  print "uhhhh"

stammer
  print "Hi!"
```

This example is functionally equivalent to the first example in this lesson,
but we didn't have to create a dedicated name (`printHi`) for the **function** **passed** to `stammer`.

So what is this line actually doing?
On line 7, we are again **calling** `stammer`, but the first (and only) **argument** is the **block** on line 8.
Since this **block** is the same **block** we used to **define** `printHi` in the earlier example,
the functional result of this **program** is exactly the same.

From just the looks of this program as is, you might notice that the **block** of code
that **defines** `stammer` and the **block** of code passed to `stammer` on line 8
seem like the same sort of fundamental thing.
And in fact they are! Both are **blocks** which follow the same rules.

### Side Note: `def`

The equivalence of the **blocks** in both cases can help explain what's going on with the `def` **function**
we glossed over earlier in this series.
You could actually **define** `def` (we'll name it `fun` here) like this:

```thy
fun is def
  block is given Function
  return block
```

Unfortunately this alternate **definition** of `def` has two problems:
it uses `def` and it only supports **functions**
(remember that we use `def` when assigning other **types** of **literals** to variables).
We'll get to a better **definition** of `def` later that resolves these issues.

### Multiple Blocks

What if a **function** takes multiple **parameters** and we want to **pass** **blocks**?
Thy has a special **keyword** `and` to allow picking up the **argument** list for a **function** **call**.

Reworking our second example from this lesson...

```thy
stammer is def
  sayMessage is given Function
  randomNumber is given Number
  sayMessage2 is given Function
  sayMessage
  print randomNumber
  sayMessage2

Here is the first call.
stammer
  print "Hi!"
and 5
  print "nope"
Here is the second call.
stammer
  print "nope"
and 1
  print "nope"
```

This example ends with two **calls** to `stammer`, each with three **arguments**:
a **block**, a number, and another **block**.

### Immediately Invoked Functions

This may seem strange and unuseful at the moment, but you can even specify a **block** as the first term
in a **function** **call** such that the **block** is immediately executed.

```thy
myComplicatedNumber is
  a is def 5
  b is def 7
  c is def 7.1
  math.add a b
  math.multiply that c
  math.sqrt that
  return that
```

Since the first term after `is` is a **block**, that **block** is what gets executed and whose **return** **value** gets stored in `myComplicatedNumber`.

Why would you want to do this?
Mainly this feature can make your code more readable
(which is a _super important_ part of programming) in some cases,
but there are some specific use cases we'll learn later that this construct is nice for.

This construct does get us one step closer to a complete **definition** of the `def` **function**:

```thy
def is
  return
    block is given Function
    return block
```

If this looks really weird, that's ok! That's why `def` is provided for you!

### Summary

- A **function** is a **value**.
- Named **functions** (stored in **variables**) are interchangeable with **blocks** (**function** **literals**).

## Control Flow

Alright. Everything you've learned up to this point is absolutely essential for programming,
but you might be feeling like the **programs** we've written so far don't really do anything special.
Like, why do we need that **program** to calculate the hypotenuse when we can just calculate the result `5` ourselves?
This lesson will hopefully start to get those creative juices flowing for programming cooler stuff.

### Conditional Code (if)

Programs can have sections of code that run conditionally.
That is, a section of code may or may not run depending on some factor.
Thy has a special **function** called `if` that enables us to do just that.

#### Example Program

Can you guess what this **program** does?

```thy
calcHypotenuse 3 4
compare.equal that 5
if that
  print "Hypotenuse was 5 as expected"
and else
  print "Hypotenuse was not 5???"

print "Done"
```

#### Explanation

Let's break this example down.

On line 1, we're running the calculation of the hypotenuse from the "Writing Functions" lesson.

On line 2, we're comparing the **value** returned by `calcHypotenuse` (`that`) to `5`.
`compare.equal` will either **return** `true` or `false` (should be `true` in this case).

On line 3, we begin our if **statement**.
Notice that we're passing 4 **arguments** to `if`:

1. `that`, referring to the **value** **returned** from line 2
2. A **block**, which prints `Hypotenuse was 5 as expected`
3. `else`, a special **variable** provided by Thy
4. Another **block**, which prints `Hypotenuse was not 5???`

The `if` **function** will check to see if the first **argument** is `true` or `false`.
If it is `true`, the second **argument** (i.e. the first **block**) will be executed.
Otherwise, the fourth **argument** (i.e. the second **block**) will be executed.

_Many other popular languages provide `if` as a `keyword` (like `is` and `and` in Thy) rather than a `function`,_
_but the usage is pretty similar._

If this explanation all sounds too complicated regarding how `if` works,
just look back at the example and don't stress over this formal description.

We expect this program to print `Hypotenuse was 5 as expected` and then `Done`.

#### Short Form

There is a shorter form of `if` as well:

```thy
calcHypotenuse 3 4
compare.equal that 5
check.not that
if that
  print "Hypotenuse was not 5???"
```

In this shorter form, nothing happens in what would be the `else` case of the previous example.

#### Returning Values

`if` can also **return** a **value**.

```thy
Assume iLikeYou is already defined.
moneyInCard is if iLikeYou
  return 50
and else
  return 1
```

In this example, `moneyInCard` will be set to `50` if `iLikeYou` is `true`,
but otherwise it will be set to `1`.

### Let

Sometimes it is useful to **return** early from a **function**.
For example, division by zero is problematic, so we may want to avoid
executing certain calculations if some **variable** is zero.

#### Without Let

We could address this with a simple `if`:

```thy
def doCalc
  a is given Number
  Maybe have some other parameters here...
  compare.equal a 0
  if that
    return 0
  and else
    math.divide 123 a
    return that
  return that
```

This approach is fine, but the indentation could start to get out of hand with additional factors.

#### With Let

Thy provides the **keyword** (not a **function**) `let` to solve this problem.
`let` can be placed before a **function** **call** **statement**
to indicate that this **block** _might_ **return** at this line.

Before you get lost with more description, let's look at our previous example modified to use `let`:

```thy
def doCalc
  a is given Number
  compare.equal a 0
  let if that
    return 0
  math.divide 123 a
  return that
```

Notice that the `if` line now starts with `let`
and that the `else` line and corresponding indentation have been removed.

`let` here means, "If the `if` call returns a value, return that value."

So if the condition `that` is true...
1. The `if` **function** calls our **block**.
2. Our block **returns** `0`.
3. The `if` **function** **returns** that `0`.
4. `let` receives the **value** `0`.
5. `let` promptly **returns** (from `doCalc`).

On the other hand, if the condition `that` is not true...
1. The `if` **function** doesn't call our **block**.
2. The `if` **function** does not **return** a **value**.
3. `let` receives no **value**.
4. `let` does not **return** (from `doCalc`).
5. (**Program** execution would continue on with line 6.)

#### Note on Other Languages

`let` is not a standard **keyword** across programming languages.
I am not aware of another language that uses the `let` **keyword**
to mean the same thing it means in Thy.

JavaScript has a `let` **keyword**,
but it is related to block-scoped mutable variable declarations,
which Thy already handles a different way.

### Looping Code

Next exciting piece of functionality: loops!

It's pretty common to write a program that has some core loop of **statements**
that run over and over again until some condition is met.
There's only one more thing we need in Thy to make this happen: the `loop.forever` **function**.

```thy
loop.forever
  Assume getUserInput is already defined and returns string provided by user.
  input is getUserInput
  compare.equal input "exit"
  let if that
    return
  print "AAAANNNDD we're still going!"
  print input
print "exited"
```

This program...

1. Gets some input string from the user.
2. If the input is `exit`, `loop` returns (go to step 5).
3. Prints `AAAANNNDD we're still going!` then the input string from the user.
4. Runs the `loop` **block** again (go to step 1).
5. Prints `exited` and finishes.

### Fake User Input

TODO: Need this? Could have semi-random string generator function that helps make some fun programs here in intro.

Up to this point, we've printed lots of **values** to the screen for the user to see,
but we haven't be able to receive any **input** from the user to use in our programs.
Although we're still not ready to do that (and it's outside the scope of this intro programming crash course),
we can imagine a **function** that could ask the user for some **input** and **return** the value back to us.

## Arrays and Objects

TODO: Teach arrays (and objects?)

## Summary of Basics

And that's a wrap!
At this point you've learned (more than) all of the critically essential building blocks of programming.
If you understand all these concepts well, you can program anything.

Make sure you understand these core concepts:

- **Program** execution (one **statement** after another in order)
- **Variables**
- Control flow (`return`, `if`, and `loop`)
- **Functions**
- **Arrays**

If you don't immediately feel confident you understand what I'm talking about with any of those five concepts,
go back now and fill in the gaps from these introductory lessons.
Since this curriculum is simultaneously an introduction to Thy in addition to programming in general,
the lesson sequence doesn't perfectly align with this simple 5-concept theory,
but I've tried to keep the lessons as close to this model as possible
while still catering to what makes Thy unique.

There are still a bunch of things left to learn, but you must master these basics for programming proficiency.

## Future Topics

- Mutable variables
- `export`, `private`, and implicit returns
- Exception handling
- Types
  - Basic types on everything
  - Templated types
- Formalization of language rules
- Asynchronous (and parallel?) Programming
- Standard library functions
- Dependency 
- Compiling
  - Interoperability with TypeScript
- Tooling
- Undefined behaviors
  - Assigning void
  - Shadowing implicit parameters
- Classes?

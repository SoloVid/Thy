As call modifier
Most like JS
Extends line lengths

aVar is await doThing one two three
doThing one two three
bVar is await this that
cVar is await
  return doThing one two three
dVar is await
  doThing one two three
  return this that

await if that
  await doAsyncA
and else
  await doAsyncB

await one
await two
await three


As statement modifier
Disadvantage of obscuring variables
Also not familiar with JS syntax

await aVar is doThing one two three


As function
Disadvantage of lots of await that

doThing one two three
aVar is await that

if that
  doAsyncA
  await that
and else
  doAsyncB
  await that
await that

one
await that
two
await that
three
await that


As dedicated statement

How? This syntax doesn't feel clear
aVar is doThing one two three
await

Maybe force this?
doThing one two three
await
aVar is that

if that
  doAsyncA
  await
and else
  doAsyncB
  await
await

one
await
two
await
three
await


As function with no arg
Basically just locks in `await that` with syntax sugar

doThing one two three
aVar is await

doThing one two three
await
aVar is that

if that
  doAsyncA
  await
and else
  doAsyncB
  await
await
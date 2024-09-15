makeMyThing is def
  propA is def "A"
  propB is calculateSomething
  useMyStuff is def
    doSomethingCool propA
    doSomethingElse propB

myThing1 is makeMyThing
myThing2 is makeMyThing

print myThing1.propA
myThing1.useMyStuff

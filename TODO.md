# Thy TODO

This document is intended to be a short-lived list of near upcoming things to do.
I want to put some things in writing that I have on my mind
so that it is easier both to pick up and put down Thy development.

- Finish multi-file interpreter/compiler
  - Make reusable test harness
    - I want the test harness to easily test both interpreter and compiler
      in pairwise fashion.
      ```ts
      await verifyInterpreterAndCompiler(__dirname, {
        expectedOutput: "some literal",
        errors: [TODO],
      })
      ```
    - The idea is to put Thy code in a relative `input` directory
      and TypeScript code in a relative `output` directory.
      This shared test harness will run the interpreter and the compiler
      on the input directory.
      The harness will also `require()` the TypeScript code
      from the output directory.
      With outputs in hand, the interpreter output can be compared
      both to the `expectedOutput` value and the `require()`'d output.
      The compiler output files can also be compared
      to the files in the output directory.
      This setup should ensure that the interpreter and compiler
      are both run against test cases and have feature parity.
    - ... I guess with this level of consolidation I could just remove
      TypeScript test code entirely from this (per test) and just have one test
      that walks all the subdirectories and does the tests.
    - I'm not entirely sure the best way to specify errors to check,
      but that can probably be resolved in working through this.
  - Build out a few key tests
    - Simplest case
    - Wildcard importing
    - TS -> Thy and Thy -> TS importing
  - Implement `new` and `load`
- Special case the generation of TS from Thy to be simple
  `export default () => {}` when no dependencies are used.
  - I want to do this partly because I'm a purist,
    but partly also for forwards-compatibility resilience of test code.
- Iron out playground code multi-file execution and editing.
- Implement playground UI API
- Optimize playground for mobile

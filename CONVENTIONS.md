# Coding Conventions for Thy

## Naming

  * `ClassOrTypeName`
  * `anyKindOfVariableOrFunctionOrNamespace`
  * `file-name.ext` (includes source files, levels, images, and audio)
  * `directory-name`
  * Do not use capital letters, spaces, or underscores in any file name.
  * `some-string-id` (don't use capital letters, spaces, or underscores)

## TypeScript Usage Conventions

* Prefer `const` first, then `let` second, then `var` last (probably never)
* Don't use semicolons
* Avoid static and global variables (and the singleton pattern) whenever possible. If it seems absolutely necessary, try really hard to find a different route out.
* Be careful with type inference. Err on the side of specifying too much type information.
  * Common cases to let type inference happen include local variables and lambda signatures.
  * Common cases to prefer explicit types over inference include member variables and function return types.
* Avoid using the "any" type. Try to be as specific as possible with typing. If you really think you want "any", consider using "unknown" instead.
* Throw exceptions (`Error` with string) when an assumption is violated and you basically want the program to crash. Catch exceptions sparingly.
* Don't use implementation inheritance. Interfaces are great, but abstract/base classes are not.
* Consider using `readonly` when possible. (Note: there are two distinct uses of the keyword)
* Feel free to use type aliases, even if it's something like the `int` type which TypeScript doesn't enforce as distinguished from `number`

## Third Party Tool Usage

* Stick to first-party APIs (browser, Node, TypeScript) whenever possible
as long as it doesn't wind up being significantly more complicated to do so.
* Prefer cross-platform dependencies.
* Dependencies already present in `package.json` are fine to continue using.
  * Notable existing dependencies include:
    * TypeScript (language)
    * esbuild (build tool)
    * Preact (front-end framework)
    * under-the-sun (test framework)

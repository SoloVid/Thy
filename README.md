# Thy (Lang)

Thy is a programming language. This project implements some tools to work with it.

## Repository Structure

- `bin/` - entrypoints for CLI
- `docs/` - end-user documentation for Thy
- `public/` - (partially dynamic) directory out of which website is served
- `src/`
  - `api/` - stuff to be exposed in the npm package
  - `code-gen/` - code generation (syntax tree to TypeScript output)
  - `editor/` - [playground](#playground) for editing/running Thy in the browser
  - `example/` - example Thy code snippets for documentation and testing
  - `home/` - [website](#website)
  - `interpreter/` - runtime interpreter for Thy
  - `parser/` - Thy parser (tokens to syntax tree)
  - `std-lib/` - implementations of Thy standard library functions
  - `tokenizer/` - Thy tokenizer (Thy source to tokens)
  - `tree/` - types for syntax tree
- `vscode-extension/` - [VS Code extension](#vscode-extension)

## Language

Thy is a programming language that is simple enough to program on your phone,
powerful enough to integrate with TypeScript,
and familiar enough to not alienate developers.

### Core Design Goals

- No special characters (mobile friendly)
- TypeScript interoperability
- Natural (relative to mainstream programming)
- Strong static types
- Simple compiler
- Simple rules
- Encourage good programming practices
- Concise (not extremely verbose)

### More Documentation

The most digestible documentation for Thy is in [docs/](./docs/),
with the two most important documents being
the [language spec](./docs/language-spec.md)
and [miscellaneous design notes](./docs/language-design.md).

## Compiler/Tools

This repository implements a compiler for Thy as well as some supporting tools
like an interpreter.

## Compiler/Tools Development

This project is built on [Node.js](https://nodejs.org/en/).
Make sure it is installed on your system before proceeding.

Install dependencies for the project:

```
npm ci
```

Build the project:

```
npm run build
```

> Note: All of these test scenarios are very much works-in-progress.
> Any number of error messages may appear running these commands.

Run tests (after building):

```
npm test
```

Run sandbox logic (after building):

```
npm start
```

Try out compiler (after building):

```
node lib/api/cli.js -t ts-namespace -r src -o dist
```

## Website

This repository also builds the website that is hosted at [thy.dev](https://thy.dev).
The primary entrypoint for this may be considered [src/home/pages/index.tsx](./src/home/pages/index.tsx).

To run the website:

```sh
npm run site:dev
```

To build the website (for static hosting):

```sh
npm run site:build
```

### Playground

A critical piece of the website is the interactive Thy playground,
which allows users to write Thy code in the browser and run it there.
This part of the website is effectively an entirely separate application
that heavily leverages the interpreter implementation.

[src/editor/playground.tsx](./src/editor/playground.tsx) is the primary entrypoint file for this.

## VSCode Extension

A core aspect of this project is IDE tooling.
Right now, Thy only has meaningful support for VSCode.

The VSCode extension lives in the... (_ahem_) `vscode-extension` directory.

The only thing the extension currently provides is syntax highlighting for Thy.

## VSCode Extension Development

To use/debug the extension (and get Thy syntax highlighting in VSCode):

- Open a fresh VSCode window
- Open the `vscode-extension` directory (as the top-level project working directory in that window)
- Press F5
  - This should open up a new VSCode window with the Thy extension enabled.
- Open this project directory in that second window
  - Thy syntax highlighting should appear in `.thy` files and `.md` files.
